// src/AssignTask.js
import React, { useState } from 'react';
import { addRoutineItem } from '../../api/api';

// This component receives the list of students as a prop
const AssignTask = ({ students }) => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [summary, setSummary] = useState('');
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (!selectedStudent || !summary || !startDateTime || !endDateTime) {
                setError('Please select a student and fill out all fields.');
                return;
            }

            const studentEmail = students.find(s => s._id === selectedStudent)?.email;
            if (!studentEmail) {
                setError('Could not find student email.');
                return;
            }

            await addRoutineItem({
                summary,
                startDateTime: new Date(startDateTime).toISOString(),
                endDateTime: new Date(endDateTime).toISOString(),
                studentEmail
            });

            setSuccess(`Task assigned to ${studentEmail} successfully!`);
            // Clear the form
            setSelectedStudent('');
            setSummary('');
            setStartDateTime('');
            setEndDateTime('');

        } catch (err) {
            setError('Failed to assign task.');
        }
    };

    return (
        <div style={{ marginTop: '30px' }}>
            <h4>Assign a New Task</h4>
            <form onSubmit={handleSubmit}>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                    <option value="">-- Select a Student --</option>
                    {students.map(student => (
                        <option key={student._id} value={student._id}>{student.name}</option>
                    ))}
                </select>
                <input type="text" placeholder="Task Summary" value={summary} onChange={e => setSummary(e.target.value)} required />
                <input type="datetime-local" value={startDateTime} onChange={e => setStartDateTime(e.target.value)} required />
                <input type="datetime-local" value={endDateTime} onChange={e => setEndDateTime(e.target.value)} required />
                <button type="submit">Assign Task</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </form>
        </div>
    );
};

export default AssignTask;