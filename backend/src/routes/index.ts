import { Router } from 'express';
import { requireAuth, optionalAuth, requireSecretKey } from '../middleware/auth';
import * as bookingController from '../controllers/bookingController';
import * as apiKeyController from '../controllers/apiKeyController';

const router = Router();

/**
 * Authentication routes
 */
router.post('/auth/secret-key', apiKeyController.authenticateSecretKey);
router.post('/auth/logout', apiKeyController.logout);

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
 * API Key management routes
 * All require secret key authentication
 */
router.get('/keys', requireSecretKey, apiKeyController.getApiKeys);
router.post('/keys', requireSecretKey, apiKeyController.createApiKey);
router.get('/keys/:id', requireSecretKey, apiKeyController.getApiKeyById);
router.put('/keys/:id', requireSecretKey, apiKeyController.updateApiKey);
router.delete('/keys/:id', requireSecretKey, apiKeyController.deleteApiKey);

export default router;
