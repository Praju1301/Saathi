import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Pages/loginPage.jsx';
import RegisterPage from './Pages/registerPage.jsx';
import ConversationPage from './Pages/conversationPage.jsx';
import DashboardPage from './Pages/DashboardPage.jsx'; // V-- IMPORT DASHBOARD
import { AuthContext } from './context/AuthContext.jsx';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
      <Route 
        path="/" 
        element={user ? <ConversationPage /> : <Navigate to="/login" />} 
      />
      {/* V-- ADD NEW PROTECTED ROUTE FOR CAREGIVERS --V */}
      <Route 
        path="/dashboard"
        element={user && user.role === 'caregiver' ? <DashboardPage /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;