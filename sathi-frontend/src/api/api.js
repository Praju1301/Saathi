// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// This is a request interceptor. It runs before every API request.
api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        // If a token exists, add it to the Authorization header
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// A specific function to fetch progress data
export const getProgressAnalytics = () => {
    return api.get('/progress/analytics');
};
export const getRoutine = () => {
    return api.get('/routine');
};

// A function to add a new routine item
export const addRoutineItem = (itemData) => {
    return api.post('/routine', itemData);
};

// A function to delete a routine item
export const deleteRoutineItem = (itemId) => {
    return api.delete(`/routine/${itemId}`);
};
// A function to send audio and get an AI interaction
export const processInteraction = (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'interaction.wav');

    // We need to set the Content-Type header to multipart/form-data
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    return api.post('/interact', formData, config);
};
export const getHistory = () => {
    return api.get('/progress/history');
};

export const getTopicAnalytics = () => {
    return api.get('/progress/topics');
};
export default api;
export const getSettings = () => {
    return api.get('/user/settings');
};

// A function to update the user's settings
export const updateSettings = (settingsData) => {
    return api.put('/user/settings', settingsData);
};
export const getStudents = () => {
    return api.get('/user/students');
};

export const linkStudent = (studentEmail) => {
    // This now correctly sends the email to the backend
    return api.post('/user/students', { studentEmail });
};
