import React, { useState, useEffect } from 'react';
import './VectorDBInsights.css';

const VectorDBInsights = ({ userName }) => {
    const [cohortHealth, setCohortHealth] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCohortHealth();
    }, []);

    const fetchCohortHealth = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/cohort/General_2024/health');
            if (response.ok) {
                const data = await response.json();
                setCohortHealth(data);
            }
        } catch (err) {
            setError('Vector DB offline');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="vector-insights loading">Loading insights...</div>;
    if (error) return null; // Silently hide if backend is offline
    if (!cohortHealth) return null;

    const getAlertColor = (level) => {
        switch (level) {
            case 'URGENT': return '#ef4444';
            case 'WARNING': return '#f59e0b';
            case 'MONITOR': return '#3b82f6';
            default: return '#10b981';
        }
    };

    return (
        <div className="vector-insights">
            <div className="insight-header">
                <h4>Community Pulse</h4>
                <span
                    className="alert-badge"
                    style={{ background: getAlertColor(cohortHealth.alert_level) }}
                >
                    {cohortHealth.alert_level}
                </span>
            </div>

            <div className="dominant-emotion">
                <span className="emotion-label">Collective Mood:</span>
                <span className="emotion-value">{cohortHealth.dominant_emotion}</span>
            </div>

            <div className="emotion-bars">
                {Object.entries(cohortHealth.emotion_profile || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([emotion, score]) => (
                        <div key={emotion} className="emotion-bar">
                            <span className="emotion-name">{emotion}</span>
                            <div className="bar-container">
                                <div
                                    className="bar-fill"
                                    style={{ width: `${score * 100}%` }}
                                />
                            </div>
                            <span className="emotion-score">{(score * 100).toFixed(0)}%</span>
                        </div>
                    ))}
            </div>

            <div className="insight-footer">
                <small>Based on {cohortHealth.total_entries} anonymous entries</small>
            </div>
        </div>
    );
};

export default VectorDBInsights;
