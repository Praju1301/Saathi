// src/SettingsPage.js
import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api/api';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
    const [settings, setSettings] = useState({ voice: 'Default', responseSpeed: 'normal' });
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        // Fetch the current settings when the page loads
        const fetchSettings = async () => {
            try {
                const response = await getSettings();
                setSettings(response.data);
            } catch (error) {
                console.error("Failed to fetch settings", error);
                setStatusMessage('Could not load current settings.');
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await updateSettings(settings);
            setStatusMessage('Settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings", error);
            setStatusMessage('Error saving settings. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [name]: value
        }));
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <Link to="/dashboard">← Back to Dashboard</Link>
            <h2>Settings</h2>

            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="voice-select">Sathi's Voice:</label>
                <select id="voice-select" name="voice" value={settings.voice} onChange={handleChange}>
                    <option value="Default">Default</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Calm">Calm</option>
                </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label>Response Speed:</label>
                <div>
                    <input type="radio" id="slow" name="responseSpeed" value="slow" checked={settings.responseSpeed === 'slow'} onChange={handleChange} />
                    <label htmlFor="slow">Slow</label>
                </div>
                <div>
                    <input type="radio" id="normal" name="responseSpeed" value="normal" checked={settings.responseSpeed === 'normal'} onChange={handleChange} />
                    <label htmlFor="normal">Normal</label>
                </div>
                <div>
                    <input type="radio" id="fast" name="responseSpeed" value="fast" checked={settings.responseSpeed === 'fast'} onChange={handleChange} />
                    <label htmlFor="fast">Fast</label>
                </div>
            </div>

            <button onClick={handleSave}>Save Settings</button>
            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );
};

export default SettingsPage;