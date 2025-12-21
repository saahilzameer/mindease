import React, { useState, useEffect } from 'react';
import './GameCommon.css';

// --- SHARED: GAME SHELL & COMPLETION ---

export const GameShell = ({ title, onBack, children }) => (
    <div className="game-container">
        <div className="game-top-bar">
            <button className="back-icon-btn" onClick={onBack} title="Back to Toolkit">
                ←
            </button>
            <div className="top-bar-title">{title}</div>
            <div style={{ width: '42px' }}></div> {/* Spacer for balance */}
        </div>
        <div className="game-content">
            {children}
        </div>
    </div>
);

const CompletionScreen = ({ title, message, onReplay, onExit }) => (
    <GameShell title="Complete" onBack={onExit}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' }}>✨</div>
        <h3 className="game-title">{title}</h3>
        <p className="game-subtitle" style={{ marginBottom: '3rem' }}>{message}</p>

        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', width: '100%', maxWidth: '280px' }}>
            <button className="soft-btn" onClick={onReplay}>Do another round</button>
            <button className="soft-btn" onClick={onExit} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
                Return to Toolkit
            </button>
        </div>
    </GameShell>
);

// --- TOOL 2: BOX BREATHING ---
export const BoxBreathing = ({ onBack }) => {
    const [phase, setPhase] = useState('inhale');
    const [cycle, setCycle] = useState(0);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (completed) return;
        let mounted = true;
        const sequence = async () => {
            while (mounted && cycle < 4) {
                setPhase('inhale'); await new Promise(r => setTimeout(r, 4000)); if (!mounted) return;
                setPhase('hold1'); await new Promise(r => setTimeout(r, 4000)); if (!mounted) return;
                setPhase('exhale'); await new Promise(r => setTimeout(r, 4000)); if (!mounted) return;
                setPhase('hold2'); await new Promise(r => setTimeout(r, 4000)); if (!mounted) return;

                setCycle(c => {
                    if (c + 1 >= 4) {
                        setCompleted(true);
                        mounted = false;
                    }
                    return c + 1;
                });
            }
        };
        sequence();
        return () => { mounted = false; };
    }, []);

    if (completed) {
        return <CompletionScreen title="Complete" message="Your breathing has slowed." onReplay={() => { setCompleted(false); setCycle(0); }} onExit={onBack} />;
    }

    const getInstruction = () => {
        switch (phase) {
            case 'inhale': return "Breathe In...";
            case 'hold1': return "Hold...";
            case 'exhale': return "Breathe Out...";
            case 'hold2': return "Hold...";
            default: return "";
        }
    };

    return (
        <GameShell title="Box Breathing" onBack={onBack}>
            <div className={`breathing-box ${phase}`}>
                <div className="breathing-core"></div>
            </div>
            <div className="phase-text" style={{ marginTop: '3rem', fontSize: '1.5rem', fontWeight: '500', minHeight: '3rem' }}>
                {getInstruction()}
            </div>

            <style>{`
                .breathing-box {
                    width: 200px;
                    height: 200px;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    transition: all 4s ease-in-out;
                }
                .breathing-core {
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%);
                    border-radius: 20px;
                    transition: all 4s ease-in-out;
                    opacity: 0.5;
                }
                .breathing-box.inhale { transform: scale(1.3); border-color: rgba(59,130,246,0.5); }
                .breathing-box.inhale .breathing-core { opacity: 1; background: radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%); }
                .breathing-box.hold1 { transform: scale(1.3); border-color: rgba(59,130,246,0.8); box-shadow: 0 0 30px rgba(59,130,246,0.2); }
                .breathing-box.exhale { transform: scale(1); border-color: rgba(255,255,255,0.1); }
                .breathing-box.exhale .breathing-core { opacity: 0.3; }
                .breathing-box.hold2 { transform: scale(1); border-color: rgba(255,255,255,0.05); }
            `}</style>
        </GameShell>
    );
};

// --- TOOL 3: GROUNDING ---
export const Grounding = ({ onBack }) => {
    const steps = [
        { count: 5, label: "Things you can SEE", icon: "👀" },
        { count: 4, label: "Things you can TOUCH", icon: "🖐️" },
        { count: 3, label: "Things you can HEAR", icon: "👂" },
        { count: 2, label: "Things you can SMELL", icon: "👃" },
        { count: 1, label: "Emotion you FEEL", icon: "❤️" }
    ];
    const [step, setStep] = useState(0);

    if (step >= steps.length) {
        return <CompletionScreen title="Grounded" message="You are here, right now." onReplay={() => setStep(0)} onExit={onBack} />;
    }

    return (
        <GameShell title="5-4-3-2-1 Grounding" onBack={onBack}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ fontSize: '6rem', opacity: 0.2, fontWeight: 'bold' }}>{steps[step].count}</div>
                <div style={{ fontSize: '1.5rem', textAlign: 'center' }}>
                    Find <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{steps[step].count}</span> {steps[step].label}
                </div>
                <div style={{ fontSize: '3rem', margin: '1rem 0' }}>{steps[step].icon}</div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    {steps.map((_, i) => (
                        <div key={i} style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: i === step ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                            transition: 'all 0.3s'
                        }} />
                    ))}
                </div>

                <button className="soft-btn" onClick={() => setStep(s => s + 1)}>
                    I found them
                </button>
            </div>
        </GameShell>
    );
};

// --- TOOL 4: PATTERN MATCH ---
export const PatternMatch = ({ onBack }) => {
    const [grid, setGrid] = useState(Array(9).fill(false));
    const [userGrid, setUserGrid] = useState(Array(9).fill(false));
    const [mode, setMode] = useState('memorize');
    const [round, setRound] = useState(1);
    const [message, setMessage] = useState("Watch the pattern...");

    useEffect(() => {
        startRound();
    }, [round]);

    const startRound = () => {
        setMode('memorize');
        setMessage("Watch carefully...");
        const newGrid = Array(9).fill(false);
        const count = round + 2;
        for (let i = 0; i < count; i++) {
            let idx;
            do { idx = Math.floor(Math.random() * 9); } while (newGrid[idx]);
            newGrid[idx] = true;
        }
        setGrid(newGrid);
        setUserGrid(Array(9).fill(false));

        setTimeout(() => {
            setMode('recall');
            setMessage("Recreate the pattern.");
        }, 2000);
    };

    const handleTap = (idx) => {
        if (mode !== 'recall') return;
        const newUserGrid = [...userGrid];
        newUserGrid[idx] = !newUserGrid[idx];
        setUserGrid(newUserGrid);

        const isMatch = newUserGrid.every((val, i) => val === grid[i]);
        if (isMatch) {
            setMode('success');
            setTimeout(() => {
                if (round === 3) {
                    setMode('complete');
                } else {
                    setRound(r => r + 1);
                }
            }, 1000);
        }
    };

    if (mode === 'complete') {
        return <CompletionScreen title="Focus Restored" message="Your mind is sharp." onReplay={() => { setRound(1); setMode('memorize'); }} onExit={onBack} />;
    }

    return (
        <GameShell title="Pattern Match" onBack={onBack}>
            <p className="game-subtitle" style={{ marginBottom: '2rem' }}>{message}</p>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                width: '300px',
                pointerEvents: mode === 'recall' ? 'auto' : 'none'
            }}>
                {Array(9).fill(0).map((_, i) => (
                    <div
                        key={i}
                        onClick={() => handleTap(i)}
                        style={{
                            width: '100%',
                            aspectRatio: '1/1',
                            background: (mode === 'memorize' && grid[i]) || (mode === 'recall' && userGrid[i]) || (mode === 'success' && grid[i])
                                ? '#a855f7'
                                : 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            boxShadow: ((mode === 'memorize' && grid[i]) || userGrid[i]) ? '0 0 20px rgba(168, 85, 247, 0.4)' : 'none',
                            transform: (userGrid[i]) ? 'scale(0.95)' : 'scale(1)'
                        }}
                    />
                ))}
            </div>
        </GameShell>
    );
};

// --- TOOL 5: BALLOON POP ---
export const BalloonPop = ({ onBack }) => {
    const [balloons, setBalloons] = useState([]);
    const [poppedCount, setPoppedCount] = useState(0);

    useEffect(() => {
        if (poppedCount >= 10) return;
        const interval = setInterval(() => {
            if (balloons.length < 5) {
                const id = Date.now();
                setBalloons(prev => [...prev, {
                    id,
                    x: Math.random() * 80 + 10,
                    hue: Math.floor(Math.random() * 360),
                    speed: 2 + Math.random() * 3
                }]);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [balloons.length, poppedCount]);

    const handlePop = (id) => {
        setBalloons(prev => prev.filter(b => b.id !== id));
        setPoppedCount(c => c + 1);
    };

    if (poppedCount >= 10) {
        return <CompletionScreen title="Tension Released" message="You let it go." onReplay={() => { setPoppedCount(0); setBalloons([]); }} onExit={onBack} />;
    }

    return (
        <GameShell title={`Balloon Pop (${10 - poppedCount} left)`} onBack={onBack}>
            <div style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                {balloons.map(b => (
                    <div
                        key={b.id}
                        onClick={() => handlePop(b.id)}
                        className="balloon-item"
                        style={{
                            position: 'absolute',
                            left: `${b.x}%`,
                            bottom: '-100px',
                            width: '60px',
                            height: '70px',
                            background: `hsla(${b.hue}, 70%, 60%, 0.8)`,
                            borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                            cursor: 'pointer',
                            boxShadow: `inset -5px -5px 10px rgba(0,0,0,0.1), 0 0 10px hsla(${b.hue}, 70%, 60%, 0.4)`,
                            animation: `floatUp ${100 / b.speed}s linear forwards`
                        }}
                    >
                        <div style={{
                            position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)',
                            width: '2px', height: '20px', background: 'rgba(255,255,255,0.5)'
                        }} />
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-500px); }
                }
                .balloon-item:active {
                    transform: scale(1.2); opacity: 0; transition: all 0.1s;
                }
            `}</style>
        </GameShell>
    );
};

// --- TOOL 6: MOVEMENT ---
export const Movement = ({ onBack }) => {
    const moves = [
        { label: "Roll your shoulders back", duration: 10, icon: "🔄" },
        { label: "Gently tilt head left & right", duration: 10, icon: "↔️" },
        { label: "Shake out your hands", duration: 10, icon: "👋" }
    ];
    const [idx, setIdx] = useState(0);

    if (idx >= moves.length) {
        return <CompletionScreen title="Body Awakened" message="Movement shifts energy." onReplay={() => setIdx(0)} onExit={onBack} />;
    }

    return (
        <GameShell title="Tiny Movement" onBack={onBack}>
            <div style={{ fontSize: '5rem', marginBottom: '2rem', animation: 'float 3s ease-in-out infinite' }}>
                {moves[idx].icon}
            </div>
            <h2 style={{ fontSize: '1.8rem', textAlign: 'center', maxWidth: '80%', lineHeight: '1.4', marginBottom: '3rem' }}>
                {moves[idx].label}
            </h2>

            <button className="soft-btn" onClick={() => setIdx(i => i + 1)}>
                Next
            </button>
        </GameShell>
    );
};
