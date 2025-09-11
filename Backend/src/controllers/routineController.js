import {
    getCalendarEvents,
    addCalendarEvent,
    deleteCalendarEvent
} from '../services/gcalendarService.js';

/**
 * @desc    Get all upcoming routine events from Google Calendar.
 * @route   GET /api/routine
 */
export const getRoutine = async (req, res, next) => {
    try {
        const events = await getCalendarEvents();
        res.json(events);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a new item (event) to the routine in Google Calendar.
 * @route   POST /api/routine
 */
export const addRoutineItem = async (req, res, next) => {
    try {
        // Destructure the new 'studentEmail' field from the request body
        const { summary, description, startDateTime, endDateTime, studentEmail } = req.body;

        if (!summary || !startDateTime || !endDateTime) {
            res.status(400);
            throw new Error('Missing required fields for routine item.');
        }
        // Pass the new data to the service
        const newEvent = await addCalendarEvent({ 
            summary, 
            description, 
            startDateTime, 
            endDateTime,
            studentEmail // Pass the student's email
        });
        res.status(201).json(newEvent);
    } catch (error) {
        next(error);
    }
};


/**
 * @desc    Delete an item (event) from the routine in Google Calendar.
 * @route   DELETE /api/routine/:id
 */
export const deleteRoutineItem = async (req, res, next) => {
    try {
        // The event ID is passed as a URL parameter
        const { id } = req.params;
        await deleteCalendarEvent(id);
        res.json({ message: 'Routine item deleted successfully.' });
    } catch (error) {
        next(error);
    }
};