import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // V-- NEW FUNCTION --V
  // This function uses the browser's Web Speech API to speak text
  const speakText = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: You can configure the voice here if needed
    // For example:
    // const voices = window.speechSynthesis.getVoices();
    // utterance.voice = voices[0]; // Select a specific voice
    
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    // ... (This function remains mostly unchanged)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const res = await axios.post('http://localhost:3001/api/conversation', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          
          // V-- CHANGE IS HERE --V
          const { userText, aiText } = res.data; // We no longer get aiAudio
          
          setConversation(prev => [...prev, { speaker: 'You', text: userText }, { speaker: 'Sathi', text: aiText }]);

          // Use our new function to make the browser speak
          speakText(aiText);

        } catch (error) {
          console.error('Error sending audio to server:', error);
          alert('Failed to get a response from the server. Please check the console.');
        } finally {
          setIsLoading(false);
          audioChunksRef.current = [];
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access the microphone. Please grant permission and try again.');
    }
  };

  const stopRecording = () => {
    // ... (This function remains unchanged)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      // Before stopping, cancel any speech that might be happening
      window.speechSynthesis.cancel();
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    // ... (The JSX return statement remains unchanged)
    <div className="container">
      <h1>Sathi - Your Companion</h1>
      <div className="conversation-box">
        {conversation.map((entry, index) => (
          <p key={index} className={`message ${entry.speaker}`}>
            <strong>{entry.speaker}:</strong> {entry.text}
          </p>
        ))}
        {isLoading && <p className="loading-text">Sathi is thinking...</p>}
      </div>
      <div className="controls">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={`record-button ${isRecording ? 'recording' : ''}`}
        >
          {isRecording ? 'Stop' : 'Speak'}
        </button>
      </div>
    </div>
  );
}

export default App;