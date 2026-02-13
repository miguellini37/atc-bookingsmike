import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendUnauthorized, sendForbidden } from '../utils/responses';
import { prisma } from '../utils/database';

/**
 * Middleware to verify session-based authentication for org portal
 * Used for VATSIM OAuth authenticated users
 */
export const requireOrgSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.cookies?.org_session;

    if (!sessionId) {
      sendUnauthorized(res, 'Session required');
      return;
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      sendUnauthorized(res, 'Invalid session');
      return;
    }

    if (session.expiresAt <= new Date()) {
      // Clean up expired session
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      res.clearCookie('org_session');
      sendUnauthorized(res, 'Session expired');
      return;
    }

    if (!session.apiKeyId) {
      sendUnauthorized(res, 'No organization selected');
      return;
    }

    // Get the API key for the selected org
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: session.apiKeyId },
    });

    if (!apiKey) {
      sendUnauthorized(res, 'Organization not found');
      return;
    }

    if (!apiKey.portalEnabled) {
      sendForbidden(res, 'Portal access is not enabled for this organization');
      return;
    }

    // Verify user is still a member
    const membership = await prisma.orgMember.findUnique({
      where: {
        cid_apiKeyId: {
          cid: session.cid,
          apiKeyId: session.apiKeyId,
        },
      },
    });

    if (!membership) {
      sendUnauthorized(res, 'You are no longer a member of this organization');
      return;
    }

    // Attach API key and session info to request
    req.apiKey = apiKey;
    req.orgSession = { cid: session.cid, role: membership.role };
    next();
  } catch (error) {
    console.error('Org session auth error:', error);
    sendUnauthorized(res, 'Authentication failed');
  }
};

/**
 * Middleware to require specific org roles
 * Must be used after requireOrgSession
 */
export const requireOrgRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.orgSession) {
      sendUnauthorized(res, 'Session required');
      return;
    }

    if (!roles.includes(req.orgSession.role)) {
      sendForbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};
