import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getProgressAnalytics, getTopicAnalytics } from '../api/api'; 
import RoutineManager from '../components/caregiver/RoutineManager';
import HistoryLog from '../components/caregiver/HistoryLog';
import StudentManager from '../components/caregiver/StudentManager';
import { Link } from 'react-router-dom';
const DashboardPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [topicData, setTopicData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, topicsRes] = await Promise.all([
                    getProgressAnalytics(),
                    getTopicAnalytics()
                ]);
                setAnalytics(analyticsRes.data);
                setTopicData(topicsRes.data);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

    
    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div>Error: {error}</div>;

    const cardStyle = {
        background: '#3a3f4a',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Caregiver Dashboard</h2>
                <Link to="/settings" style={{ background: '#007bff', color: 'white', padding: '10px 15px', borderRadius: '5px', textDecoration: 'none' }}>Settings</Link>
            </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Change style to className */}
                <div className="card"> 
                    {/* ... Total Interactions content ... */}
                </div>
                <div className="card">
                    {/* ... Emotion Distribution content ... */}
                </div>
                <div className="card">
                    {/* ... Interaction Trend content ... */}
                </div>
                <div className="card">
                    {/* ... Conversation Topics content ... */}
                </div>
            </div>

            {/* Management sections */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <StudentManager />
            </div>
            <div className="card" style={{ marginTop: '2rem' }}>
                <RoutineManager />
            </div>
            <div className="card" style={{ marginTop: '2rem' }}>
                <HistoryLog />
            </div>
        </div>
    );
};

export default DashboardPage;