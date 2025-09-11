import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role to student
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const API_URL = 'http://localhost:5000/api/auth/login';
            const response = await axios.post(API_URL, { email, password });

            // Check if the role from the server matches the selected role
            if (response.data.role !== role) {
                setError(`You are registered as a ${response.data.role}. Please select the correct role.`);
                return;
            }
            
            // Store token and role
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userRole', response.data.role);

            // Redirect based on role
            if (response.data.role === 'caregiver') {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/student';
            }
            
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {/* The title now dynamically changes based on the selected role */}
            <h2>Login as a {role.charAt(0).toUpperCase() + role.slice(1)}</h2>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setRole('student')} style={{ marginRight: '10px', background: role === 'student' ? '#61dafb' : 'grey' }}>
                    I'm a Student
                </button>
                <button onClick={() => setRole('caregiver')} style={{ background: role === 'caregiver' ? '#61dafb' : 'grey' }}>
                    I'm a Caregiver
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email: </label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Password: </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                <button type="submit" style={{ marginTop: '20px' }}>Login</button>
            </form>
            <p style={{ marginTop: '20px' }}>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default LoginPage;