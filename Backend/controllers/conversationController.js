import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import Conversation from '../models/conversation.model.js';
import User from '../models/user.model.js'; // Import User model
import { google } from 'googleapis'; // Import googleapis
import { oauth2Client } from './calendarController.js'; // Import the configured OAuth client
import * as chrono from 'chrono-node'; // Corrected import // Import the date-parsing library


// --- AI Service Implementations ---

// V-- FIXED: This function was missing and has been added --V
// 1. Implements the Speech-to-Text Engine (OpenAI Whisper)
const transcribeAudio = async (filePath) => {
  const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('model', 'whisper-1');

  try {
    const response = await axios.post(WHISPER_API_URL, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    console.log('Whisper Transcription:', response.data.text);
    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio with Whisper:', error.response ? error.response.data : error.message);
    throw new Error('Failed to transcribe audio.');
  }
};

// 2. This function calls our Python microservice for emotion detection
const getEmotionFromAudio = async (filePath) => {
  const EMOTION_API_URL = 'http://localhost:5000/analyze_emotion';
  const form = new FormData();
  form.append('audio', fs.createReadStream(filePath));

  try {
    const response = await axios.post(EMOTION_API_URL, form, {
      headers: { ...form.getHeaders() },
    });
    console.log('Emotion Service Response:', response.data.emotion);
    return response.data.emotion;
  } catch (error) {
    console.error('Error getting emotion from service:', error.message);
    return 'neutral'; // Fallback emotion
  }
};
 // Load environment variables right here
// 3. This function gets a response from Google Gemini
const getGeminiResponse = async (text, emotion) => {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  // V-- UPDATED PROMPT WITH INTENT DETECTION --V
  const prompt = `
    Analyze the following user message. The user sounds ${emotion}.
    First, determine the user's intent. The intent can be "schedule" or "conversation".
    If the intent is "schedule", extract the summary of the event.
    
    Return a JSON object with two properties: "intent" and "responseText".
    If the intent is "schedule", also include a "summary" property.
    
    Example 1:
    User message: "remind me to call the doctor tomorrow"
    Response: { "intent": "schedule", "summary": "call the doctor", "responseText": "Sure, I can set that reminder. What time tomorrow?" }

    Example 2:
    User message: "I had a great day at school"
    Response: { "intent": "conversation", "responseText": "That's wonderful to hear! What made it so great?" }

    User message: "${text}"
  `;

  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    // The response from Gemini should be a JSON string, so we parse it.
    const jsonResponseString = response.data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonResponseString);
  } catch (error)    {
    console.error('Error getting Gemini response:', error);
    // Fallback in case of an error
    return { intent: 'conversation', responseText: "I'm sorry, I'm having a little trouble understanding. Could you say that again?" };
  }
};


// --- Main Controller Logic ---
export const processConversation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded.' });
    }
    const audioFilePath = req.file.path;

    const [userText, detectedEmotion] = await Promise.all([
        transcribeAudio(audioFilePath),
        getEmotionFromAudio(audioFilePath)
    ]);
    
    let geminiResponse = await getGeminiResponse(userText, detectedEmotion);

    // V-- NEW LOGIC FOR SCHEDULING --V
    if (geminiResponse.intent === 'schedule') {
        const user = await User.findById(req.user._id);
        if (!user || !user.googleAccessToken) {
            // User has not linked their Google account yet
            geminiResponse.responseText = "It looks like you want to set a reminder, but you haven't connected your Google account yet. You can do that in your profile settings.";
        } else {
            // Use chrono-node to find date and time in the user's message
            const dateResults = chrono.parse(userText);
            if (dateResults.length > 0) {
                const startTime = dateResults[0].start.date();
                // Set the event to be 30 minutes long by default
                const endTime = new Date(startTime.getTime() + 30 * 60000);

                // Set user's credentials on the OAuth client
                oauth2Client.setCredentials({
                    access_token: user.googleAccessToken,
                    refresh_token: user.googleRefreshToken,
                });
                
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
                
                await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: {
                        summary: geminiResponse.summary,
                        start: { dateTime: startTime.toISOString() },
                        end: { dateTime: endTime.toISOString() },
                    },
                });

                geminiResponse.responseText = `OK, I've set a reminder for you: "${geminiResponse.summary}" on ${startTime.toLocaleString()}.`;
            }
        }
    }

    // Save the final conversation turn to the database
    await Conversation.create({
        user: req.user._id,
        userMessage: userText,
        sathiResponse: geminiResponse.responseText,
        emotion: detectedEmotion,
    });

    res.json({ userText, aiText: geminiResponse.responseText });
    
    fs.unlinkSync(audioFilePath);
  } catch (error) {
    console.error('Error in conversation pipeline:', error.message);
    res.status(500).send('An error occurred during the conversation process.');
  }
};