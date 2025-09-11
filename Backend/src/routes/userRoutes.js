import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getUserSettings,
    updateUserSettings,
    linkStudent,
    getLinkedStudents
} from '../controllers/userController.js';

const router = express.Router();
router.use(protect);

router.route('/settings')
    .get(getUserSettings)
    .put(updateUserSettings);

router.route('/students')
    .post(linkStudent)
    .get(getLinkedStudents);

export default router;