import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// V-- NEW PROTECTED ROUTE --V
// The 'protect' middleware will run before 'getUserProfile'
router.get('/profile', protect, getUserProfile);

export default router;