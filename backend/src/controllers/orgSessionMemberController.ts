import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
  sendForbidden,
  sendServerError,
} from '../utils/responses';
import { prisma } from '../utils/database';
import { syncRoster } from '../services/vatsimRosterSync';

/**
 * Get all members for the current organization
 * GET /org/session/members
 * Allowed: admin, manager
 */
export const getMembers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const members = await prisma.orgMember.findMany({
      where: { apiKeyId: req.apiKey!.id },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, members);
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

/**
 * Add a member to the current organization
 * POST /org/session/members
 * Allowed: admin (any role), manager (member role only)
 */
export const addMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { cid, role = 'member' } = req.body;

    if (!cid) {
      return sendBadRequest(res, 'CID is required');
    }

    // Manager can only add members with 'member' role
    if (req.orgSession!.role === 'manager' && role !== 'member') {
      return sendForbidden(res, 'Managers can only add members with the member role');
    }

    // Check valid role
    if (!['member', 'manager', 'admin'].includes(role)) {
      return sendBadRequest(res, 'Invalid role. Must be member, manager, or admin');
    }

    // Check if member already exists
    const existingMember = await prisma.orgMember.findUnique({
      where: { cid_apiKeyId: { cid, apiKeyId: req.apiKey!.id } },
    });

    if (existingMember) {
      return sendBadRequest(res, 'Member already exists in this organization');
    }

    const member = await prisma.orgMember.create({
      data: {
        cid,
        apiKeyId: req.apiKey!.id,
        role,
      },
    });

    return sendCreated(res, member);
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

/**
 * Update a member's role
 * PUT /org/session/members/:id
 * Allowed: admin only, cannot change own role
 */
export const updateMemberRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return sendBadRequest(res, 'Invalid member ID');
    }

    const { role } = req.body;

    if (!role || !['member', 'manager', 'admin'].includes(role)) {
      return sendBadRequest(res, 'Invalid role. Must be member, manager, or admin');
    }

    const existingMember = await prisma.orgMember.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return sendNotFound(res, 'Member not found');
    }

    if (existingMember.apiKeyId !== req.apiKey!.id) {
      return sendNotFound(res, 'Member not found');
    }

    // Cannot change own role
    if (existingMember.cid === req.orgSession!.cid) {
      return sendBadRequest(res, 'You cannot change your own role');
    }

    const member = await prisma.orgMember.update({
      where: { id },
      data: { role },
    });

    return sendSuccess(res, member);
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

/**
 * Remove a member from the organization
 * DELETE /org/session/members/:id
 * Allowed: admin (anyone except self), manager (member role only, not self)
 */
export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
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

    if (existingMember.apiKeyId !== req.apiKey!.id) {
      return sendNotFound(res, 'Member not found');
    }

    // Cannot remove self
    if (existingMember.cid === req.orgSession!.cid) {
      return sendBadRequest(res, 'You cannot remove yourself');
    }

    // Manager can only remove members with 'member' role
    if (req.orgSession!.role === 'manager' && existingMember.role !== 'member') {
      return sendForbidden(res, 'Managers can only remove members with the member role');
    }

    await prisma.orgMember.delete({
      where: { id },
    });

    return sendNoContent(res);
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

/**
 * Sync roster from VATSIM Core API
 * POST /org/session/members/sync
 * Allowed: admin only
 */
export const syncFromVatsim = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const vatsimApiKey = process.env.VATSIM_API_KEY;

    if (!vatsimApiKey) {
      return sendServerError(res, 'VATSIM API key is not configured');
    }

    const apiKey = req.apiKey!;
    const result = await syncRoster(apiKey.id, apiKey.division, apiKey.subdivision, vatsimApiKey);

    return sendSuccess(res, result, `Roster synced: ${result.added} added, ${result.existing} existing, ${result.total} total`);
  } catch (error) {
    console.error('Error syncing VATSIM roster:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return sendServerError(res, `Failed to sync roster: ${message}`);
  }
};
