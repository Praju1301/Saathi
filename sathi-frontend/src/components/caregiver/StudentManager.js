// src/StudentManager.js
import React, { useState, useEffect } from 'react';
import { getStudents, linkStudent } from '../../api/api';
import AssignTask from './AssignTask';

const StudentManager = () => {
    const [students, setStudents] = useState([]);
    const [studentEmail, setStudentEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchStudents = async () => {
        try {
            const response = await getStudents();
            setStudents(response.data);
        } catch (err) {
            setError('Failed to fetch students.');
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleLinkStudent = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            // This will fail for now, we'll fix it next
            await linkStudent(studentEmail); 
            setSuccess('Student linked successfully! Refreshing...');
            setStudentEmail('');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to link student.');
        }
    };

    return (
        <div style={{ marginTop: '50px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <h3>Manage Students</h3>
            <form onSubmit={handleLinkStudent}>
                <input
                    type="email"
                    placeholder="Enter Student's Email to Link"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                />
                <button type="submit">Link Student</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>

            <h4>Linked Students:</h4>
            {students.length > 0 ? (
                <ul>
                    {students.map(student => (
                        <li key={student._id}>{student.name} ({student.email})</li>
                    ))}
                </ul>
            ) : (
                <p>No students have been linked yet.</p>
            )}
            {students.length > 0 && <AssignTask students={students} />}
        </div>
    );
};

export default StudentManager;