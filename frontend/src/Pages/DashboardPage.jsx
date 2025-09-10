import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import './DashboardPage.css';

const DashboardPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { api } = useContext(AuthContext);

  // Fetch the list of students when the component loads
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await api.get('/dashboard/students');
        setStudents(data);
      } catch (error) {
        console.error('Failed to fetch students', error);
      }
    };
    fetchStudents();
  }, [api]);

  // Fetch logs when a student is selected
  const handleStudentSelect = async (studentId) => {
    if (!studentId) {
      setSelectedStudent(null);
      setLogs([]);
      return;
    }
    setLoading(true);
    const student = students.find(s => s._id === studentId);
    setSelectedStudent(student);
    try {
      const { data } = await api.get(`/dashboard/logs/${studentId}`);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs', error);
      setLogs([]); // Clear logs on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Caregiver Dashboard</h1>
      <div className="student-selector">
        <label htmlFor="student-select">Select a Student:</label>
        <select id="student-select" onChange={(e) => handleStudentSelect(e.target.value)}>
          <option value="">-- Please choose a student --</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      <div className="logs-container">
        <h2>Conversation History For: {selectedStudent ? selectedStudent.name : '...'}</h2>
        {loading ? (
          <p>Loading logs...</p>
        ) : logs.length > 0 ? (
          logs.map((log) => (
            <div key={log._id} className="log-entry">
              <p className="log-meta">
                <span>Emotion: <span className={`emotion ${log.emotion}`}>{log.emotion}</span></span>
                <span>{new Date(log.createdAt).toLocaleString()}</span>
              </p>
              <p><strong>Student:</strong> {log.userMessage}</p>
              <p><strong>Sathi:</strong> {log.sathiResponse}</p>
            </div>
          ))
        ) : (
          <p>No logs to display. Select a student to begin.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;