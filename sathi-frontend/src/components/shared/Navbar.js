// src/components/shared/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
    };

    return (
        <nav style={{ background: '#1e2127', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444' }}>
            <Link to="/" style={{ color: '#61dafb', fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>Sathi</Link>
            <div>
                {token ? (
                    <>
                        {role === 'caregiver' && <Link to="/dashboard" style={{ color: 'white', margin: '0 1rem', textDecoration: 'none' }}>Dashboard</Link>}
                        {role === 'student' && <Link to="/student" style={{ color: 'white', margin: '0 1rem', textDecoration: 'none' }}>My Day</Link>}
                        <button onClick={handleLogout} style={{ background: '#f44336', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'white', margin: '0 1rem', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" style={{ color: 'white', margin: '0 1rem', textDecoration: 'none' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;