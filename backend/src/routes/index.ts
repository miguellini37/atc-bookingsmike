import { Router } from 'express';
import { requireAuth, optionalAuth, requireSecretKey } from '../middleware/auth';
import { requireOrgSession, requireOrgRole } from '../middleware/orgAuth';
import * as bookingController from '../controllers/bookingController';
import * as apiKeyController from '../controllers/apiKeyController';
import * as orgController from '../controllers/orgController';
import * as vatsimAuthController from '../controllers/vatsimAuthController';
import * as orgMemberController from '../controllers/orgMemberController';
import * as orgSessionMemberController from '../controllers/orgSessionMemberController';
import * as orgSessionBookingController from '../controllers/orgSessionBookingController';

const router = Router();

/**
 * Admin authentication routes
 */
router.post('/auth/secret-key', apiKeyController.authenticateSecretKey);
router.post('/auth/logout', apiKeyController.logout);

/**
 * VATSIM OAuth routes (for organization portal)
 */
router.get('/oauth/vatsim', vatsimAuthController.redirectToVatsim);
router.get('/oauth/vatsim/callback', vatsimAuthController.handleVatsimCallback);
router.get('/oauth/session', vatsimAuthController.getSession);
router.post('/oauth/session/org', vatsimAuthController.switchOrganization);
router.post('/oauth/logout', vatsimAuthController.logout);

/**
 * Booking routes
 * Public read access, authenticated write access
 */
router.get('/bookings', optionalAuth, bookingController.getBookings);
router.post('/bookings', requireAuth, bookingController.createBooking);
router.get('/bookings/:id', requireAuth, bookingController.getBookingById);
router.put('/bookings/:id', requireAuth, bookingController.updateBooking);
router.delete('/bookings/:id', requireAuth, bookingController.deleteBooking);

/**
 * Organization portal routes (Bearer token auth - for API users)
 */
router.get('/org/me', requireAuth, orgController.getMyOrganization);
router.get('/org/bookings', requireAuth, orgController.getMyBookings);

/**
 * Organization portal routes (Session auth - for VATSIM OAuth users)
 */
router.get('/org/session/me', requireOrgSession, orgController.getMyOrganization);

/**
 * Session-based member management (admin/manager)
 */
router.post('/org/session/members/sync', requireOrgSession, requireOrgRole('admin'), orgSessionMemberController.syncFromVatsim);
router.get('/org/session/members', requireOrgSession, requireOrgRole('admin', 'manager'), orgSessionMemberController.getMembers);
router.post('/org/session/members', requireOrgSession, requireOrgRole('admin', 'manager'), orgSessionMemberController.addMember);
router.put('/org/session/members/:id', requireOrgSession, requireOrgRole('admin'), orgSessionMemberController.updateMemberRole);
router.delete('/org/session/members/:id', requireOrgSession, requireOrgRole('admin', 'manager'), orgSessionMemberController.removeMember);

/**
 * Session-based booking CRUD (role enforcement inside controller)
 */
router.get('/org/session/bookings', requireOrgSession, orgSessionBookingController.getBookings);
router.post('/org/session/bookings', requireOrgSession, orgSessionBookingController.createBooking);
router.put('/org/session/bookings/:id', requireOrgSession, orgSessionBookingController.updateBooking);
router.delete('/org/session/bookings/:id', requireOrgSession, orgSessionBookingController.deleteBooking);

/**
 * Organization member management routes (admin only)
 */
router.get('/org-members', requireSecretKey, orgMemberController.getOrgMembers);
router.get('/org-members/all', requireSecretKey, orgMemberController.getAllMembers);
router.post('/org-members', requireSecretKey, orgMemberController.addMember);
router.put('/org-members/:id', requireSecretKey, orgMemberController.updateMember);
router.delete('/org-members/:id', requireSecretKey, orgMemberController.removeMember);

/**
 * API Key management routes (admin only)
 */
router.get('/keys', requireSecretKey, apiKeyController.getApiKeys);
router.post('/keys', requireSecretKey, apiKeyController.createApiKey);
router.get('/keys/:id', requireSecretKey, apiKeyController.getApiKeyById);
router.put('/keys/:id', requireSecretKey, apiKeyController.updateApiKey);
router.delete('/keys/:id', requireSecretKey, apiKeyController.deleteApiKey);

export default router;
