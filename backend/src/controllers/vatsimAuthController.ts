import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { prisma } from '../utils/database';
import { sendSuccess, sendBadRequest, sendUnauthorized } from '../utils/responses';

// VATSIM OAuth configuration
const VATSIM_AUTH_URL = process.env.VATSIM_AUTH_URL || 'https://auth.vatsim.net/oauth/authorize';
const VATSIM_TOKEN_URL = process.env.VATSIM_TOKEN_URL || 'https://auth.vatsim.net/oauth/token';
const VATSIM_USER_URL = process.env.VATSIM_USER_URL || 'https://auth.vatsim.net/api/user';
const VATSIM_CLIENT_ID = process.env.VATSIM_CLIENT_ID;
const VATSIM_CLIENT_SECRET = process.env.VATSIM_CLIENT_SECRET;
const VATSIM_REDIRECT_URI = process.env.VATSIM_REDIRECT_URI;

// Store state tokens temporarily (in production, use Redis or database)
const stateTokens = new Map<string, { createdAt: number }>();

// Clean up old state tokens periodically
setInterval(() => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [token, data] of stateTokens.entries()) {
    if (data.createdAt < fiveMinutesAgo) {
      stateTokens.delete(token);
    }
  }
}, 60 * 1000);

/**
 * Redirect to VATSIM OAuth login
 * GET /api/oauth/vatsim
 */
export const redirectToVatsim = async (
  _req: Request,
  res: Response
): Promise<void> => {
  if (!VATSIM_CLIENT_ID || !VATSIM_REDIRECT_URI) {
    res.status(500).json({
      success: false,
      message: 'VATSIM OAuth not configured',
    });
    return;
  }

  // Generate state token for CSRF protection
  const state = randomBytes(32).toString('hex');
  stateTokens.set(state, { createdAt: Date.now() });

  const params = new URLSearchParams({
    client_id: VATSIM_CLIENT_ID,
    redirect_uri: VATSIM_REDIRECT_URI,
    response_type: 'code',
    scope: 'full_name vatsim_details',
    state,
  });

  res.redirect(`${VATSIM_AUTH_URL}?${params.toString()}`);
};

/**
 * Handle VATSIM OAuth callback
 * GET /api/oauth/vatsim/callback
 */
export const handleVatsimCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code, state, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || '';

  if (error) {
    res.redirect(`${frontendUrl}/org/login?error=access_denied`);
    return;
  }

  if (!code || !state) {
    res.redirect(`${frontendUrl}/org/login?error=invalid_request`);
    return;
  }

  // Verify state token
  if (!stateTokens.has(state as string)) {
    res.redirect(`${frontendUrl}/org/login?error=invalid_state`);
    return;
  }
  stateTokens.delete(state as string);

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(VATSIM_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: VATSIM_CLIENT_ID!,
        client_secret: VATSIM_CLIENT_SECRET!,
        redirect_uri: VATSIM_REDIRECT_URI!,
        code: code as string,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      res.redirect(`${frontendUrl}/org/login?error=token_exchange_failed`);
      return;
    }

    const tokenData = await tokenResponse.json() as { access_token: string };
    const accessToken = tokenData.access_token;

    // Fetch user info from VATSIM
    const userResponse = await fetch(VATSIM_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error('User info fetch failed:', await userResponse.text());
      res.redirect(`${frontendUrl}/org/login?error=user_fetch_failed`);
      return;
    }

    interface VatsimUserResponse {
      data: {
        cid: number;
        personal: {
          name_first: string;
          name_last: string;
        };
      };
    }

    const userData = await userResponse.json() as VatsimUserResponse;
    const cid = userData.data.cid.toString();
    const name = `${userData.data.personal.name_first} ${userData.data.personal.name_last}`;

    // Check if user is a member of any organization
    const memberships = await prisma.orgMember.findMany({
      where: { cid },
      include: {
        apiKey: {
          select: {
            id: true,
            name: true,
            division: true,
            subdivision: true,
          },
        },
      },
    });

    if (memberships.length === 0) {
      res.redirect(`${frontendUrl}/org/login?error=no_organization`);
      return;
    }

    // Create session
    const sessionId = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.session.create({
      data: {
        id: sessionId,
        cid,
        name,
        apiKeyId: memberships[0].apiKeyId, // Default to first org
        expiresAt,
      },
    });

    // Set session cookie and redirect
    res.cookie('org_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.redirect(`${frontendUrl}/org`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(`${frontendUrl}/org/login?error=server_error`);
  }
};

/**
 * Get current session user info
 * GET /api/oauth/session
 */
export const getSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const sessionId = req.cookies?.org_session;

  if (!sessionId) {
    return sendUnauthorized(res, 'No session');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.expiresAt < new Date()) {
    res.clearCookie('org_session');
    return sendUnauthorized(res, 'Session expired');
  }

  // Get user's organizations
  const memberships = await prisma.orgMember.findMany({
    where: { cid: session.cid },
    include: {
      apiKey: {
        select: {
          id: true,
          name: true,
          division: true,
          subdivision: true,
          key: true,
        },
      },
    },
  });

  const currentOrg = memberships.find((m) => m.apiKeyId === session.apiKeyId);

  return sendSuccess(res, {
    cid: session.cid,
    name: session.name,
    currentOrg: currentOrg?.apiKey || null,
    organizations: memberships.map((m) => ({
      id: m.apiKey.id,
      name: m.apiKey.name,
      division: m.apiKey.division,
      subdivision: m.apiKey.subdivision,
      role: m.role,
    })),
  });
};

/**
 * Switch current organization
 * POST /api/oauth/session/org
 */
export const switchOrganization = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const sessionId = req.cookies?.org_session;
  const { orgId } = req.body;

  if (!sessionId) {
    return sendUnauthorized(res, 'No session');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.expiresAt < new Date()) {
    res.clearCookie('org_session');
    return sendUnauthorized(res, 'Session expired');
  }

  // Verify user is member of the organization
  const membership = await prisma.orgMember.findUnique({
    where: {
      cid_apiKeyId: {
        cid: session.cid,
        apiKeyId: orgId,
      },
    },
  });

  if (!membership) {
    return sendBadRequest(res, 'You are not a member of this organization');
  }

  // Update session
  await prisma.session.update({
    where: { id: sessionId },
    data: { apiKeyId: orgId },
  });

  return sendSuccess(res, { switched: true });
};

/**
 * Logout
 * POST /api/oauth/logout
 */
export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const sessionId = req.cookies?.org_session;

  if (sessionId) {
    await prisma.session.delete({
      where: { id: sessionId },
    }).catch(() => {}); // Ignore if session doesn't exist
  }

  res.clearCookie('org_session');
  return sendSuccess(res, { loggedOut: true });
};
