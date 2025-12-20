import React, { useMemo } from 'react';

const WellnessDashboard = ({ onClose, actionLog, wellnessUsage, realityChecks }) => {
    // Calculate agent insight based on patterns
    const agentInsight = useMemo(() => {
        const total = Object.values(wellnessUsage).reduce((a, b) => a + b, 0);
        const breathingCount = wellnessUsage.breathing || 0;
        const groundingCount = wellnessUsage.grounding || 0;

        if (total === 0) {
            return "Your agent is observing how you respond to different supports.";
        }

        if (breathingCount > groundingCount && breathingCount > 2) {
            return "Right now, your agent notices that short actions help more than conversation.";
        }

        if (groundingCount > 2) {
            return "You respond better to grounding before problem-solving.";
        }

        if (actionLog.length > 5) {
            return "Small movements are helping you regain momentum.";
        }

        return "Your agent sees you showing up, even when it's hard.";
    }, [actionLog, wellnessUsage]);

    // Recent actions (last 10)
    const recentActions = actionLog.slice(-10).reverse();

    return (
        <div className="wellness-overlay" onClick={onClose}>
            <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                <h2 className="dashboard-title">Wellness Dashboard</h2>
                <p className="dashboard-subtitle">Observational, not instructional. No guilt, no pressure.</p>

                <div className="dashboard-scroll">
                    {/* Action Bridging Log - KILLER FEATURE */}
                    <section className="dashboard-section">
                        <h3 className="section-title">Moments you moved, even when it was hard</h3>
                        {recentActions.length === 0 ? (
                            <p className="empty-state">Your agent is ready to notice when you move.</p>
                        ) : (
                            <>
                                <div className="action-list">
                                    {recentActions.map((item, i) => (
                                        <div key={i} className="action-item">
                                            <span className="action-icon">
                                                {item.type === 'wellness' ? '🌬️' :
                                                    item.type === 'mood' ? '💭' : '✓'}
                                            </span>
                                            <div className="action-details">
                                                <div className="action-text">{item.action}</div>
                                                <div className="action-time">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="section-note">These aren't achievements. They're signs of regained control.</p>
                            </>
                        )}
                    </section>

                    {/* Wellness Box Usage */}
                    <section className="dashboard-section">
                        <h3 className="section-title">What helped your body settle</h3>
                        {Object.values(wellnessUsage).every(v => v === 0) ? (
                            <p className="empty-state">Try the Wellness Box when you feel dysregulated.</p>
                        ) : (
                            <>
                                <div className="wellness-stats">
                                    {wellnessUsage.breathing > 0 && (
                                        <div className="stat-item">
                                            <div className="stat-icon">🌬️</div>
                                            <div className="stat-text">
                                                <div className="stat-label">Breathing exercises</div>
                                                <div className="stat-value">{wellnessUsage.breathing}</div>
                                            </div>
                                        </div>
                                    )}
                                    {wellnessUsage.grounding > 0 && (
                                        <div className="stat-item">
                                            <div className="stat-icon">🖐️</div>
                                            <div className="stat-text">
                                                <div className="stat-label">Grounding activities</div>
                                                <div className="stat-value">{wellnessUsage.grounding}</div>
                                            </div>
                                        </div>
                                    )}
                                    {wellnessUsage.patterns > 0 && (
                                        <div className="stat-item">
                                            <div className="stat-icon">🧩</div>
                                            <div className="stat-text">
                                                <div className="stat-label">Focus games</div>
                                                <div className="stat-value">{wellnessUsage.patterns}</div>
                                            </div>
                                        </div>
                                    )}
                                    {wellnessUsage.movement > 0 && (
                                        <div className="stat-item">
                                            <div className="stat-icon">🏃</div>
                                            <div className="stat-text">
                                                <div className="stat-label">Movement prompts</div>
                                                <div className="stat-value">{wellnessUsage.movement}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="section-note">Your body responds better to short, physical resets than long advice.</p>
                            </>
                        )}
                    </section>

                    {/* Reality Check History */}
                    {realityChecks.length > 0 && (
                        <section className="dashboard-section">
                            <h3 className="section-title">Grounded truths you returned to</h3>
                            <div className="reality-list">
                                {realityChecks.slice(-5).reverse().map((check, i) => (
                                    <div key={i} className="reality-item">
                                        "{check.text}"
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Agent Insight - ONE LINE ONLY */}
                    <section className="dashboard-insight">
                        <div className="insight-icon">🧠</div>
                        <p className="insight-text">{agentInsight}</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default WellnessDashboard;
