import { Router } from 'express';
import { requireAuth, optionalAuth, requireSecretKey } from '../middleware/auth';
import { requireOrgSession } from '../middleware/orgAuth';
import * as bookingController from '../controllers/bookingController';
import * as apiKeyController from '../controllers/apiKeyController';
import * as orgController from '../controllers/orgController';
import * as vatsimAuthController from '../controllers/vatsimAuthController';
import * as orgMemberController from '../controllers/orgMemberController';

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
router.get('/org/session/bookings', requireOrgSession, orgController.getMyBookings);

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
