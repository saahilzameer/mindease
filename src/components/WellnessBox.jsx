import React, { useState, useEffect } from 'react';

const WellnessBox = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('menu');

    const handleActivityStart = (activity) => {
        setActiveTab(activity);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'breathing': return <BoxBreathing onBack={() => setActiveTab('menu')} />;
            case 'grounding': return <GroundingExercise onBack={() => setActiveTab('menu')} />;
            case 'patterns': return <PatternMatching onBack={() => setActiveTab('menu')} />;
            case 'balloons': return <BalloonGame onBack={() => setActiveTab('menu')} />;
            case 'movement': return <MovementGenerator onBack={() => setActiveTab('menu')} />;
            default: return (
                <div className="wellness-menu">
                    <h3>Wellness Toolkit</h3>
                    <p>Choose a gentle way to reset.</p>
                    <div className="menu-grid">
                        <button onClick={() => handleActivityStart('breathing')}>🌬️ Box Breathing</button>
                        <button onClick={() => handleActivityStart('grounding')}>🖐️ 5-4-3-2-1 Grounding</button>
                        <button onClick={() => handleActivityStart('patterns')}>🧩 Pattern Matching</button>
                        <button onClick={() => handleActivityStart('balloons')}>🎈 Balloon Pop</button>
                        <button onClick={() => handleActivityStart('movement')}>🏃 Tiny Movement</button>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="wellness-overlay" onClick={onClose}>
            <div className="wellness-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>
                {renderContent()}
            </div>
        </div>
    );
};

// --- Sub-Components ---

const BoxBreathing = ({ onBack }) => {
    const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
    const [counter, setCounter] = useState(4);

    useEffect(() => {
        const timer = setInterval(() => {
            setCounter((c) => {
                if (c === 1) {
                    setPhase((p) => {
                        if (p === 'Inhale') return 'Hold ';
                        if (p === 'Hold ') return 'Exhale';
                        if (p === 'Exhale') return 'Hold';
                        return 'Inhale';
                    });
                    return 4;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="activity-container">
            <h4>Box Breathing</h4>
            <div className={`breathing-circle ${phase.toLowerCase().trim()}`}>
                <div className="counter">{counter}</div>
            </div>
            <p className="phase-label">{phase}</p>
            <button className="back-btn" onClick={onBack}>Back to menu</button>
        </div>
    );
};

const GroundingExercise = ({ onBack }) => {
    const steps = [
        { count: 5, prompt: "things you see" },
        { count: 4, prompt: "things you can touch" },
        { count: 3, prompt: "things you hear" },
        { count: 2, prompt: "things you smell" },
        { count: 1, prompt: "thing you taste" }
    ];
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <div className="activity-container">
            <h4>5-4-3-2-1 Grounding</h4>
            <div className="grounding-step">
                <div className="step-number">{steps[currentStep].count}</div>
                <p>{steps[currentStep].prompt}</p>
            </div>
            <div className="progress-dots">
                {steps.map((_, i) => <div key={i} className={`dot ${i === currentStep ? 'active' : ''}`} />)}
            </div>
            {currentStep < steps.length - 1 ? (
                <button className="action-btn-light" onClick={() => setCurrentStep(s => s + 1)}>Next</button>
            ) : (
                <button className="action-btn-light" onClick={onBack}>I feel more grounded</button>
            )}
            <button className="back-btn" onClick={onBack}>Exit</button>
        </div>
    );
};

const PatternMatching = ({ onBack }) => {
    const shapes = ['🔴', '🔷', '⭐', '🔺', '🟢'];
    const [target, setTarget] = useState('');
    const [options, setOptions] = useState([]);
    const [matches, setMatches] = useState(0);

    const generateLevel = () => {
        const t = shapes[Math.floor(Math.random() * shapes.length)];
        setTarget(t);
        setOptions([...shapes].sort(() => Math.random() - 0.5));
    };

    useEffect(() => {
        generateLevel();
    }, []);

    const handleSelect = (s) => {
        if (s === target) {
            if (matches === 4) {
                setMatches(5);
            } else {
                setMatches(m => m + 1);
                generateLevel();
            }
        }
    };

    return (
        <div className="activity-container">
            <h4>Pattern Matching</h4>
            {matches < 5 ? (
                <>
                    <p>Find the match:</p>
                    <div className="target-shape">{target}</div>
                    <div className="options-grid">
                        {options.map((s, i) => (
                            <button key={i} onClick={() => handleSelect(s)}>{s}</button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="completion-msg">
                    <p>Gentle focus complete.</p>
                    <button className="action-btn-light" onClick={onBack}>Done</button>
                </div>
            )}
            <button className="back-btn" onClick={onBack}>Exit</button>
        </div>
    );
};

const BalloonGame = ({ onBack }) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ffd3b6', '#ff8b94'];
    const [balloons, setBalloons] = useState([]);
    const [popped, setPopped] = useState(0);

    useEffect(() => {
        // Generate 12 balloons in random positions
        const newBalloons = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            left: Math.random() * 80 + 10, // 10-90% from left
            top: Math.random() * 70 + 10,  // 10-80% from top
            size: Math.random() * 30 + 50  // 50-80px
        }));
        setBalloons(newBalloons);
    }, []);

    const popBalloon = (id) => {
        setBalloons(prev => prev.filter(b => b.id !== id));
        setPopped(prev => prev + 1);
    };

    return (
        <div className="activity-container">
            <h4>Balloon Pop</h4>
            <p className="balloon-instruction">Gently tap to release</p>
            {balloons.length > 0 ? (
                <div className="balloon-field">
                    {balloons.map(balloon => (
                        <div
                            key={balloon.id}
                            className="balloon"
                            style={{
                                left: `${balloon.left}%`,
                                top: `${balloon.top}%`,
                                width: `${balloon.size}px`,
                                height: `${balloon.size * 1.2}px`,
                                backgroundColor: balloon.color,
                            }}
                            onClick={() => popBalloon(balloon.id)}
                        >
                            🎈
                        </div>
                    ))}
                </div>
            ) : (
                <div className="completion-msg">
                    <p>Gentle release complete.</p>
                    <button className="action-btn-light" onClick={onBack}>Done</button>
                </div>
            )}
            <button className="back-btn" onClick={onBack}>Exit</button>
        </div>
    );
};

const MovementGenerator = ({ onBack }) => {
    const prompts = [
        "Shake your hands for 10 seconds",
        "Stand up and sit back down",
        "Roll your shoulders 3 times",
        "Take 5 steps in any direction",
        "Stretch your arms high above your head",
        "Gently tilt your head from side to side"
    ];
    const [prompt, setPrompt] = useState(prompts[0]);

    const nextPrompt = () => {
        let next;
        do {
            next = prompts[Math.floor(Math.random() * prompts.length)];
        } while (next === prompt);
        setPrompt(next);
    };

    return (
        <div className="activity-container">
            <h4>Tiny Movement</h4>
            <div className="movement-prompt">
                <p>{prompt}</p>
            </div>
            <button className="action-btn-light" style={{ marginBottom: '1rem' }} onClick={nextPrompt}>Another one</button>
            <button className="back-btn" onClick={onBack}>Done</button>
        </div>
    );
};

export default WellnessBox;
