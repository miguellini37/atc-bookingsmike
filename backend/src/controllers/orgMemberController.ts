import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
  sendValidationError,
} from '../utils/responses';
import { prisma } from '../utils/database';
import { z } from 'zod';
import { formatZodErrors } from '../utils/validation';

// Validation schemas
const createMemberSchema = z.object({
  cid: z.string().min(1, 'CID is required'),
  apiKeyId: z.number().int().positive('Organization ID is required'),
  role: z.enum(['member', 'manager', 'admin']).default('manager'),
});

const updateMemberSchema = z.object({
  role: z.enum(['member', 'manager', 'admin']),
});

/**
 * Get all members for an organization
 * GET /api/org-members?orgId=X
 */
export const getOrgMembers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const orgId = parseInt(req.query.orgId as string);

  if (isNaN(orgId)) {
    return sendBadRequest(res, 'Organization ID is required');
  }

  const members = await prisma.orgMember.findMany({
    where: { apiKeyId: orgId },
    orderBy: { createdAt: 'desc' },
  });

  return sendSuccess(res, members);
};

/**
 * Get all members across all organizations
 * GET /api/org-members/all
 */
export const getAllMembers = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const members = await prisma.orgMember.findMany({
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
    orderBy: { createdAt: 'desc' },
  });

  return sendSuccess(res, members);
};

/**
 * Add a member to an organization
 * POST /api/org-members
 */
export const addMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const validation = createMemberSchema.safeParse(req.body);

  if (!validation.success) {
    return sendValidationError(res, formatZodErrors(validation.error));
  }

  const { cid, apiKeyId, role } = validation.data;

  // Check if organization exists
  const org = await prisma.apiKey.findUnique({
    where: { id: apiKeyId },
  });

  if (!org) {
    return sendNotFound(res, 'Organization not found');
  }

  // Check if member already exists
  const existingMember = await prisma.orgMember.findUnique({
    where: {
      cid_apiKeyId: { cid, apiKeyId },
    },
  });

  if (existingMember) {
    return sendBadRequest(res, 'Member already exists in this organization');
  }

  const member = await prisma.orgMember.create({
    data: {
      cid,
      apiKeyId,
      role,
    },
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

  return sendCreated(res, member);
};

/**
 * Update a member's role
 * PUT /api/org-members/:id
 */
export const updateMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return sendBadRequest(res, 'Invalid member ID');
  }

  const validation = updateMemberSchema.safeParse(req.body);

  if (!validation.success) {
    return sendValidationError(res, formatZodErrors(validation.error));
  }

  const existingMember = await prisma.orgMember.findUnique({
    where: { id },
  });

  if (!existingMember) {
    return sendNotFound(res, 'Member not found');
  }

  const member = await prisma.orgMember.update({
    where: { id },
    data: { role: validation.data.role },
  });

  return sendSuccess(res, member);
};

/**
 * Remove a member from an organization
 * DELETE /api/org-members/:id
 */
export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return sendBadRequest(res, 'Invalid member ID');
  }

  const existingMember = await prisma.orgMember.findUnique({
    where: { id },
  });

  if (!existingMember) {
    return sendNotFound(res, 'Member not found');
  }

  await prisma.orgMember.delete({
    where: { id },
  });

  return sendNoContent(res);
};
