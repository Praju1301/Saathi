import Conversation from '../models/conversation.model.js';
import User from '../models/user.model.js';

// @desc    Get all conversation logs for a specific student
// @route   GET /api/dashboard/logs/:studentId
// @access  Private (for caregivers)
export const getConversationLogs = async (req, res) => {
  try {
    // Check if the logged-in user is a caregiver
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({ message: 'Forbidden: Access is restricted to caregivers.' });
    }

    // Find the student by the ID provided in the URL parameter
    const student = await User.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Fetch all conversations for that student, sorted by the newest first
    const logs = await Conversation.find({ user: req.params.studentId }).sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching conversation logs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get all student users
 * @route   GET /api/dashboard/students
 * @access  Private (Caregivers only)
 */
export const getStudents = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({ message: 'Forbidden: Access is restricted to caregivers.' });
    }
    // Find all users where the role is 'student' and select only their name and ID
    const students = await User.find({ role: 'student' }).select('name _id');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};