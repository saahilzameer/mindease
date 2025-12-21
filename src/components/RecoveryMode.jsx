import React from 'react';

const RecoveryMode = ({ onAction, lastActionLabel = "Try Again" }) => {
    return (
        <div className="recovery-overlay">
            <div className="recovery-card">
                <div className="recovery-header">
                    <h2 className="recovery-title">Let’s keep going</h2>
                    <p className="recovery-subtext">Choose how you want to continue.</p>
                </div>

                <div className="recovery-actions">
                    <button
                        className="voice-primary-btn recovery-btn"
                        onClick={() => onAction('retry')}
                    >
                        {lastActionLabel}
                    </button>

                    <button
                        className="recovery-btn-secondary"
                        onClick={() => onAction('talk_no_ai')}
                    >
                        <span className="icon">💬</span> Talk without AI
                    </button>

                    <button
                        className="recovery-btn-secondary"
                        onClick={() => onAction('instant_calm')}
                    >
                        <span className="icon">🌬️</span> Instant Calm Tool
                    </button>

                    <button
                        className="recovery-btn-secondary"
                        onClick={() => onAction('wellness')}
                    >
                        <span className="icon">🤍</span> Wellness Toolkit
                    </button>

                    <button
                        className="recovery-btn-minimal"
                        onClick={() => onAction('back')}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecoveryMode;
