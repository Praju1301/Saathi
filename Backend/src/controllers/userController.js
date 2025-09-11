// src/controllers/userController.js
import User from '../models/User.js';

/**
 * @desc    Get the settings for the logged-in user.
 * @route   GET /api/user/settings
 */
export const getUserSettings = async (req, res, next) => {
    try {
        // The user object is attached to the request by the 'protect' middleware
        const user = await User.findById(req.user._id);
        if (user) {
            res.json(user.settings);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update the settings for the logged-in user.
 * @route   PUT /api/user/settings
 */
export const updateUserSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.settings.voice = req.body.voice || user.settings.voice;
            user.settings.responseSpeed = req.body.responseSpeed || user.settings.responseSpeed;

            const updatedUser = await user.save();
            res.json(updatedUser.settings);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};
/**
 * @desc    Link a student to the logged-in caregiver using the student's email.
 * @route   POST /api/user/students
 */
export const linkStudent = async (req, res, next) => {
    try {
        const caregiver = await User.findById(req.user._id);
        // We now expect studentEmail from the frontend
        const { studentEmail } = req.body;

        if (caregiver.role !== 'caregiver') {
            res.status(403); // Forbidden
            throw new Error('Only caregivers can link students.');
        }

        // Find the student in the database by their email
        const student = await User.findOne({ email: studentEmail });

        if (!student || student.role !== 'student') {
            res.status(404);
            throw new Error('No student found with this email, or the user is not a student.');
        }

        // Get the student's ID from the user object we found
        const studentId = student._id;

        // Add student's ID to caregiver's list if not already present
        if (!caregiver.students.includes(studentId)) {
            caregiver.students.push(studentId);
            await caregiver.save();
        }

        res.status(200).json({ message: 'Student linked successfully.' });
    } catch (error) {
        next(error);
    }
};
/**
 * @desc    Get all students linked to the logged-in caregiver.
 * @route   GET /api/user/students
 */
export const getLinkedStudents = async (req, res, next) => {
    try {
        if (req.user.role !== 'caregiver') {
            res.status(403);
            throw new Error('Only caregivers can view students.');
        }

        // Find the caregiver and populate the 'students' field with full user details
        const caregiver = await User.findById(req.user._id).populate('students', 'name email');

        if (!caregiver) {
            res.status(404);
            throw new Error('Caregiver not found.');
        }

        res.json(caregiver.students);
    } catch (error) {
        next(error);
    }
};