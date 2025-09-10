import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

// ... (transcribeAudio and getTextToSpeech/speakText functions remain the same)
// You should still have transcribeAudio and getGeminiResponse from the previous step.

const transcribeAudio = async (filePath) => {
    // ... (This function remains unchanged)
};

// V-- NEW FUNCTION --V
// This function calls our Python microservice
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
    // Return a neutral emotion as a fallback
    return 'neutral';
  }
};


const getGeminiResponse = async (text, emotion) => {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  // V-- UPDATED PROMPT --V
  // We now include the user's emotion as context for the AI
  const prompt = `The user sounds ${emotion}. Please provide an empathetic and appropriate response to the following message: "${text}"`;

  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const aiText = response.data.candidates[0].content.parts[0].text;
    console.log('Gemini Response:', aiText);
    return aiText;
  } catch (error)    {
    console.error('Error getting Gemini response:', error.response ? error.response.data : error.message);
    throw new Error('Failed to get response from Gemini.');
  }
};


// --- Main Controller Logic ---
export const processConversation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded.' });
    }
    const audioFilePath = req.file.path;

    // V-- UPDATED PIPELINE --V
    // We run transcription and emotion analysis in parallel for efficiency
    const [userText, detectedEmotion] = await Promise.all([
        transcribeAudio(audioFilePath),
        getEmotionFromAudio(audioFilePath)
    ]);
    
    // Pass both text and emotion to Gemini
    const aiText = await getGeminiResponse(userText, detectedEmotion);

    res.json({ userText, aiText });
    
    // Clean up the uploaded file
    fs.unlinkSync(audioFilePath);
  } catch (error) {
    console.error('Error in conversation pipeline:', error.message);
    res.status(500).send('An error occurred during the conversation process.');
  }
};