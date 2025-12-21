import React, { useState, useEffect, useRef } from 'react';

const Login = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name to continue.');
            return;
        }
        onLogin(name.trim());
    };

    return (
        <div className="login-overlay">
            <div className="login-card">
                <div className="login-brand">
                    <h1>MindEase</h1>
                </div>

                <div className="login-header">
                    <h2>Welcome to MindEase</h2>
                    <p>Let’s start gently. What should we call you?</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Enter your name"
                            className={error ? 'input-error' : ''}
                            aria-label="Enter your name"
                        />
                        {error && <span className="error-message">{error}</span>}
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={!name.trim()}
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
