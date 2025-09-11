import Interaction from '../models/Interaction.js';
import mongoose from 'mongoose';

/**
 * @desc    Get progress analytics based on the logged-in user's interactions.
 * @route   GET /api/progress/analytics
 */
export const getProgressAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        // --- Metric 1: Get the total number of interactions ---
        const totalInteractions = await Interaction.countDocuments({ user: userId });

        // --- Metric 2: Get emotion distribution using the powerful MongoDB Aggregation Pipeline ---
        const emotionDistribution = await Interaction.aggregate([
            // Stage 1: Filter documents to only include those from the logged-in user
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            // Stage 2: Group the documents by the 'detectedEmotion' field and count them
            { $group: { _id: '$detectedEmotion', count: { $sum: 1 } } },
            // Stage 3: Reshape the output documents to be more user-friendly
            { $project: { _id: 0, emotion: '$_id', count: '$count' } }
        ]);

        // --- Metric 3: Get interaction trends over the last 7 days ---
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const interactionTrend = await Interaction.aggregate([
            // Stage 1: Filter documents from the last 7 days for the current user
            { $match: { user: new mongoose.Types.ObjectId(userId), createdAt: { $gte: sevenDaysAgo } } },
            // Stage 2: Group by the creation date (formatted as YYYY-MM-DD) and count interactions
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 } 
                } 
            },
            // Stage 3: Sort the results by date to ensure the line graph is correct
            { $sort: { _id: 1 } },
            // Stage 4: Reshape the output
            { $project: { _id: 0, date: '$_id', count: '$count' } }
        ]);
        
        // Send all the calculated analytics back in a single JSON object
        res.json({
            totalInteractions,
            emotionDistribution,
            interactionTrend,
        });

    } catch (error) {
        next(error);
    }
};
/**
 * @desc    Get all interactions for the logged-in user, sorted by newest first.
 * @route   GET /api/progress/history
 */
export const getInteractionHistory = async (req, res, next) => {
    try {
        const interactions = await Interaction.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(interactions);
    } catch (error) {
        next(error);
    }
};
/**
 * @desc    Get topic distribution for the logged-in user.
 * @route   GET /api/progress/topics
 */
export const getTopicAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const topicDistribution = await Interaction.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $project: { _id: 0, name: '$_id', value: '$count' } } // Format for pie chart
        ]);
        res.json(topicDistribution);
    } catch (error) {
        next(error);
    }
};