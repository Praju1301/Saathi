import React, { useState, useEffect } from 'react';
import { getHistory } from '../../api/api';

const HistoryLog = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await getHistory();
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <p>Loading history...</p>;

    return (
        <div style={{ marginTop: '50px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <h3>Interaction History</h3>
            {history.length === 0 ? (
                <p>No interactions have been recorded yet.</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {history.map(item => (
                        <li key={item._id} style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px', marginBottom: '10px' }}>
                            <p><strong>User Said:</strong> "{item.transcribedText}"</p>
                            <p><strong>Detected Emotion:</strong> {item.detectedEmotion}</p>
                            <p><strong>Sathi Replied:</strong> "{item.responseText}"</p>
                            <small>{new Date(item.createdAt).toLocaleString()}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HistoryLog;