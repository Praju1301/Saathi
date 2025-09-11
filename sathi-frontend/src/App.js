// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import RegisterPage from './Pages/RegisterPage.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import DashboardPage from './Pages/DashboardPage.jsx';
import StudentPage from './Pages/StudentPage.jsx';
import SettingsPage from './Pages/SettingsPage.jsx';
import Navbar from './components/shared/Navbar.js';
import './App.css';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (!token) return <Navigate to="/login" />;
    if (!allowedRoles.includes(userRole)) return <Navigate to="/login" />;
    return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/student" element={<PrivateRoute allowedRoles={['student']}><StudentPage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute allowedRoles={['caregiver']}><DashboardPage /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute allowedRoles={['caregiver']}><SettingsPage /></PrivateRoute>} />
            <Route path="/" element={<Navigate to={localStorage.getItem('authToken') ? (localStorage.getItem('userRole') === 'caregiver' ? '/dashboard' : '/student') : '/login'} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;