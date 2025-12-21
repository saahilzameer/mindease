import React, { useMemo } from 'react';
import VectorDBInsights from './VectorDBInsights';

const WellnessDashboard = ({ onClose, actionLog, wellnessUsage, realityChecks }) => {
    // Calculate agent insight based on patterns
    const agentInsight = useMemo(() => {
        const total = Object.values(wellnessUsage).reduce((a, b) => a + b, 0);
        const breathingCount = wellnessUsage.breathing || 0;
        const groundingCount = wellnessUsage.grounding || 0;

        if (total === 0) {
            return "Your assistant is observing how you respond to different supports. Take your time.";
        }

        if (breathingCount > groundingCount && breathingCount > 2) {
            return "The assistant noticed that short physical breaths are your strongest bridge to calm.";
        }

        if (groundingCount > 2) {
            return "You seem to respond best to grounding your senses before moving into planning.";
        }

        if (actionLog.length > 5) {
            return "Gentle momentum is building. Each small movement matters.";
        }

        return "I see the effort you're putting in. We'll keep things manageable.";
    }, [actionLog, wellnessUsage]);

    // Calculate Evolution Score (0-100)
    const evolutionStats = useMemo(() => {
        const totalActions = actionLog.length;
        const totalWellness = Object.values(wellnessUsage).reduce((a, b) => a + b, 0);
        const totalReality = realityChecks.length;

        // Progress weightings
        const rawScore = (totalActions * 5) + (totalWellness * 15) + (totalReality * 10);
        const cappedScore = Math.min(rawScore, 100);

        // Circular progress calculations
        const radius = 90;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (cappedScore / 100) * circumference;

        return {
            score: cappedScore,
            offset,
            circumference,
            totalWellness
        };
    }, [actionLog, wellnessUsage, realityChecks]);

    const recentActions = actionLog.slice(-10).reverse();

    return (
        <div className="wellness-overlay" onClick={onClose}>
            <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
                {/* Standardized Top Bar */}
                <div className="voice-top-bar">
                    <button className="voice-back-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <div className="voice-brand">EVOLUTION</div>
                    <div className="top-right-space"></div>
                </div>

                <div className="dashboard-scroll">
                    {/* Evolution Round Hero */}
                    <section className="evolution-hero">
                        <div className="wellness-orbit-container">
                            <svg className="wellness-orbit-svg" width="200" height="200" viewBox="0 0 200 200">
                                <defs>
                                    <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                                <circle className="orbit-bg" cx="100" cy="100" r="90" />
                                <circle
                                    className="orbit-progress"
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    strokeDasharray={evolutionStats.circumference}
                                    strokeDashoffset={evolutionStats.offset}
                                />
                            </svg>
                            <div className="orbit-content">
                                <span className="evolution-score">{evolutionStats.score}</span>
                                <span className="evolution-label">Exp</span>
                            </div>
                        </div>
                        <div className="hero-text">
                            <h2 className="agent-ready-title">Your Evolution</h2>
                            <p className="agent-ready-subtitle">Tracking your journey back to clarity.</p>
                        </div>
                    </section>

                    {/* Wellness Stats */}
                    <section className="wellness-stats">
                        <div className="stat-item">
                            <div className="stat-label">Rituals</div>
                            <div className="stat-value">{evolutionStats.totalWellness}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Moods</div>
                            <div className="stat-value">{actionLog.filter(a => a.type === 'mood').length}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Grounding</div>
                            <div className="stat-value">{realityChecks.length}</div>
                        </div>
                    </section>

                    {/* Action Timeline */}
                    <section className="dashboard-section">
                        <h3 className="section-title">Momentum Stream</h3>
                        {recentActions.length === 0 ? (
                            <div className="empty-state">No moments logged today. Take your first step.</div>
                        ) : (
                            <div className="action-timeline">
                                {recentActions.map((item, i) => (
                                    <div key={i} className="action-item" style={{ animationDelay: `${i * 0.1}s` }}>
                                        <div className="action-icon-circle">
                                            {item.type === 'wellness' ? '✦' : item.type === 'mood' ? '❤' : '→'}
                                        </div>
                                        <div className="action-details">
                                            <div className="action-text">{item.action}</div>
                                            <div className="action-time">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Agent Insight Card */}
                    <section className="dashboard-insight">
                        <div className="insight-content">
                            <span className="insight-badge">GEMINI OBSERVATION</span>
                            <p className="insight-text">"{agentInsight}"</p>
                        </div>
                    </section>

                    {/* Vector DB Community Insights */}
                    <section className="dashboard-section">
                        <VectorDBInsights />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default WellnessDashboard;

