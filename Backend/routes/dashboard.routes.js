import express from 'express';
import { getConversationLogs, getStudents } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/students', protect, getStudents); // V-- ADD NEW ROUTE
router.get('/logs/:studentId', protect, getConversationLogs);

export default router;