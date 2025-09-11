import React, { useState, useRef, useEffect } from 'react';
import { processInteraction, getRoutine } from '../api/api';
import VisualFeedback from '../components/shared/VisualFeedback'; // Assuming VisualFeedback.js is in the same folder

const StudentPage = () => {
    const [status, setStatus] = useState('idle');
    const [responseText, setResponseText] = useState('Hello! I am Sathi. Press the button and talk to me.');
    const [routine, setRoutine] = useState([]); // <-- New state for the routine

    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    // Fetch the routine when the component loads
    useEffect(() => {
        const fetchRoutine = async () => {
            try {
                const response = await getRoutine();
                setRoutine(response.data);
            } catch (error) {
                console.error("Failed to fetch routine", error);
            }
        };
        fetchRoutine();
    }, []);


    // Function to start the audio recording
    const startRecording = async () => {
        try {
            // Request microphone access from the user
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Initialize the MediaRecorder
            mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            // Event handler for when audio data is available
            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            // Event handler for when recording stops
            mediaRecorder.current.onstop = async () => {
                setStatus('processing'); // Update status to show we're thinking
                
                // Create a single audio Blob from the recorded chunks
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                audioChunks.current = []; // Clear chunks for the next recording

                try {
                    // Send the audio to the backend API
                    const response = await processInteraction(audioBlob);
                    const { textResponse, audioResponse } = response.data;
                    
                    // Update the text and status for the response
                    setResponseText(textResponse);
                    setStatus('speaking');
                    
                    // Create and play the audio response from the backend
                    const audio = new Audio(`data:audio/wav;base64,${audioResponse}`);
                    audio.play();
                    
                    // When the audio finishes playing, return to idle state
                    audio.onended = () => setStatus('idle');

                } catch (error) {
                    console.error("Error processing interaction:", error);
                    setResponseText('I had a little trouble understanding. Could you try again?');
                    setStatus('idle');
                }
            };

            // Start recording and update the UI status
            mediaRecorder.current.start();
            setStatus('recording');

        } catch (error) {
            console.error("Error accessing microphone:", error);
            setResponseText('I need permission to use your microphone. Please allow it in your browser.');
            setStatus('idle');
        }
    };

    // Function to stop the audio recording
    const stopRecording = () => {
        if (mediaRecorder.current && status === 'recording') {
            mediaRecorder.current.stop();
        }
    };

    // Manages the button's text, color, and action based on the current status
    const getButtonState = () => {
        switch (status) {
            case 'idle':
            case 'speaking':
                return { text: 'Tap to Speak', action: startRecording, color: '#4CAF50', disabled: false };
            case 'recording':
                return { text: 'Tap to Stop', action: stopRecording, color: '#f44336', disabled: false };
            case 'processing':
                return { text: 'Processing...', action: () => {}, color: '#2196F3', disabled: true };
            default:
                return { text: 'Tap to Speak', action: startRecording, color: '#4CAF50', disabled: false };
        }
    };

    const buttonState = getButtonState();

     return (
        // Use aria-live to announce status changes to screen readers
        <div role="main" aria-live="polite" style={{ textAlign: 'center', padding: '50px' }}>
            <VisualFeedback status={status} responseText={responseText} />

            <button
                onClick={buttonState.action}
                disabled={buttonState.disabled}
                aria-label={buttonState.text}
                // Remove inline styles and let the global CSS handle it
            >
                {buttonState.text}
            </button>
        </div>
    );
};

export default StudentPage;