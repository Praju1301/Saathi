import { google } from 'googleapis';
import User from '../models/user.model.js';

// V-- EXPORT THIS CLIENT --V
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
// --- 1. Generate Auth URL ---
// This function creates the URL the user will visit to grant permission
export const getAuthUrl = (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' gets a refresh token
    scope: scopes,
    state: req.user._id.toString(), // Pass the user ID to identify them in the callback
  });
  res.json({ url });
};

// --- 2. Handle OAuth2 Callback ---
// Google redirects here after the user grants permission
export const handleCallback = async (req, res) => {
  const { code, state: userId } = req.query;
  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token } = tokens;

    // Save the tokens to the corresponding user in the database
    await User.findByIdAndUpdate(userId, {
      googleAccessToken: access_token,
      googleRefreshToken: refresh_token,
    });

    // Redirect the user back to the frontend application
    res.redirect('http://localhost:5173'); // Adjust if your frontend runs on a different port
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.status(500).send('Authentication failed');
  }
};

// --- 3. Create a Calendar Event ---
export const createEvent = async (req, res) => {
  const { summary, description, startTime, endTime } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.googleAccessToken) {
      return res.status(401).json({ message: 'User not authenticated with Google' });
    }

    // Set the credentials for the API call
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: { dateTime: startTime, timeZone: 'Asia/Kolkata' },
        end: { dateTime: endTime, timeZone: 'Asia/Kolkata' },
      },
    });

    res.status(201).json({ message: 'Event created successfully', event: event.data });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};