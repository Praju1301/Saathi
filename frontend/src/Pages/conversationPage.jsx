import React, { useState, useRef, useContext } from 'react';
import './ConversationPage.css';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

function ConversationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { user, logout, api } = useContext(AuthContext); // Use our custom api instance

  // ... (speakText function remains the same)

  const startRecording = async () => {
    // ... (This function remains the same, but the axios call inside onstop will be updated)
    mediaRecorderRef.current.onstop = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
            // Use the custom 'api' instance which includes the auth token
            const res = await api.post('/conversation', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const { userText, aiText } = res.data;
            setConversation(prev => [...prev, { speaker: 'You', text: userText }, { speaker: 'Sathi', text: aiText }]);
            speakText(aiText);
        } catch (error) {
            console.error('Error sending audio to server:', error);
            alert('Failed to get a response from the server.');
        } finally {
            setIsLoading(false);
            audioChunksRef.current = [];
        }
    };
    // ...
  };

  // ... (stopRecording function remains the same)

  const handleConnectCalendar = async () => {
    try {
        const { data } = await api.get('/calendar/auth');
        // Redirect the user to the Google auth URL
        window.location.href = data.url;
    } catch (error) {
        console.error('Error connecting to Google Calendar', error);
        alert('Could not connect to Google Calendar.');
    }
  };

    return (
    <div className="container">
      <div className="header">
        <h1>Welcome, {user?.name}!</h1>
        <div>
          {/* V-- CONDITIONALLY RENDER DASHBOARD LINK --V */}
          {user?.role === 'caregiver' && (
            <Link to="/dashboard">
                <button className="header-button">Dashboard</button>
            </Link>
          )}
          <button onClick={handleConnectCalendar} className="header-button">Connect Calendar</button>
          <button onClick={logout} className="header-button logout">Logout</button>
        </div>
      </div>
      {/* ... (rest of the JSX) */}
    </div>
  );
}

export default ConversationPage;