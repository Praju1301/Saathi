import express from 'express';
import { getAuthUrl, handleCallback, createEvent } from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to get the Google authentication URL
router.get('/auth', protect, getAuthUrl);

// Route for Google to call back to after authentication
router.get('/callback', handleCallback);

// Route to create a new calendar event
router.post('/create-event', protect, createEvent);

export default router;