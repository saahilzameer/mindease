import React, { useState, useEffect, useRef } from 'react';
import './GameCommon.css';
import { GameShell } from './QuickGames';

// --- GAME 1: MOOD CONSTELLATION ---
export const MoodConstellation = ({ onBack }) => {
    const [stars, setStars] = useState([]);
    const [lines, setLines] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [reflection, setReflection] = useState('');

    useEffect(() => {
        const initialStars = Array.from({ length: 7 }, (_, i) => ({
            id: i,
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20,
            active: false
        }));
        setStars(initialStars);
    }, []);

    const handleStarClick = (id) => {
        if (completed) return;

        const newStars = stars.map(s => s.id === id ? { ...s, active: true } : s);
        setStars(newStars);

        const activeStars = newStars.filter(s => s.active);
        if (activeStars.length > 1) {
            const current = activeStars[activeStars.length - 1];
            const prev = activeStars[activeStars.length - 2];
            setLines(l => [...l, { x1: prev.x, y1: prev.y, x2: current.x, y2: current.y }]);
        }

        if (activeStars.length === stars.length) {
            setCompleted(true);
            const reflections = [
                "Your feelings create a unique map.",
                "Chaos, when connected, becomes a pattern.",
                "Even in the dark, there is structure.",
                "You have mapped the sky of your mind."
            ];
            setReflection(reflections[Math.floor(Math.random() * reflections.length)]);
        }
    };

    return (
        <GameShell title="Mood Constellation" onBack={onBack}>
            <div className="game-subtitle" style={{ marginBottom: '2rem' }}>{completed ? reflection : "Tap the stars to connect your feelings."}</div>
            <div className="interactive-zone" style={{ cursor: 'pointer' }}>
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                    {lines.map((line, i) => (
                        <line key={i} x1={`${line.x1}%`} y1={`${line.y1}%`} x2={`${line.x2}%`} y2={`${line.y2}%`} stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" strokeLinecap="round" />
                    ))}
                </svg>
                {stars.map(star => (
                    <div
                        key={star.id}
                        onClick={() => handleStarClick(star.id)}
                        style={{
                            position: 'absolute',
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: star.active ? '#fff' : 'rgba(255,255,255,0.3)',
                            transform: star.active ? 'scale(1.2)' : 'scale(1)',
                            boxShadow: star.active ? '0 0 15px white' : 'none',
                            transition: 'all 0.5s ease',
                            cursor: 'pointer',
                            zIndex: 2
                        }}
                    />
                ))}
            </div>
            {completed && <button className="soft-btn" onClick={() => { setStars([]); setLines([]); setCompleted(false); }}>Reset</button>}
        </GameShell>
    );
};

// --- GAME 2: BREATH RIPPLE ---
export const BreathRipple = ({ onBack }) => {
    const [isHolding, setIsHolding] = useState(false);
    const [scale, setScale] = useState(1);
    const [phaseText, setPhaseText] = useState("Hold to Inhale");

    useEffect(() => {
        let interval;
        if (isHolding) {
            setPhaseText("Inhaling...");
            interval = setInterval(() => {
                setScale(s => Math.min(s + 0.02, 3));
            }, 30);
        } else {
            setPhaseText(scale > 1.2 ? "Exhaling..." : "Hold to Inhale");
            interval = setInterval(() => {
                setScale(s => Math.max(s - 0.03, 1));
            }, 30);
        }
        return () => clearInterval(interval);
    }, [isHolding, scale]);

    return (
        <GameShell title="Breath Ripple" onBack={onBack}>
            <div className="game-subtitle" style={{ marginBottom: '2rem' }}>Hold to inhale, release to exhale.</div>
            <div className="interactive-zone"
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                style={{ cursor: 'pointer', userSelect: 'none' }}>

                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #3b82f6, #06b6d4)',
                    transform: `scale(${scale})`,
                    transition: isHolding ? 'none' : 'transform 1s ease-out',
                    boxShadow: `0 0 ${scale * 20}px rgba(59, 130, 246, 0.5)`,
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.9)',
                    pointerEvents: 'none'
                }}>
                </div>
                <div style={{
                    position: 'absolute',
                    top: '60%',
                    pointerEvents: 'none',
                    opacity: 0.7,
                    letterSpacing: '1px'
                }}>
                    {phaseText}
                </div>
            </div>
        </GameShell>
    );
};

// --- GAME 3: ONE-WORD ORBIT ---
export const OneWordOrbit = ({ onBack }) => {
    const [word, setWord] = useState('');
    const [orbitingWords, setOrbitingWords] = useState([]);

    const handleAdd = (e) => {
        if (e.key === 'Enter' && word.trim()) {
            setOrbitingWords(prev => [...prev, { text: word, angle: Math.random() * 360, speed: 0.5 + Math.random() * 0.5, dist: 120 + Math.random() * 60 }]);
            setWord('');
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setOrbitingWords(prev => prev.map(w => ({ ...w, angle: w.angle + w.speed })));
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <GameShell title="One-Word Orbit" onBack={onBack}>
            <div className="game-subtitle" style={{ marginBottom: '1rem' }}>Put your feelings into orbit.</div>
            <div className="interactive-zone" style={{ perspective: '1000px' }}>
                {/* Center Core */}
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 0 30px white',
                    position: 'absolute',
                    zIndex: 10
                }} />

                {orbitingWords.map((w, i) => {
                    const rad = w.angle * (Math.PI / 180);
                    const x = Math.cos(rad) * w.dist;
                    const z = Math.sin(rad) * (w.dist * 0.4); // Elliptical orbit effect
                    const scale = (z + 200) / 200; // Fake depth scale
                    const opacity = (z + 100) / 200;

                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            transform: `translate(${x}px, ${z * 0.5}px) scale(${scale})`, // Flattened Y for 3D effect
                            color: '#e2e8f0',
                            textShadow: '0 0 5px rgba(168, 85, 247, 0.8)',
                            fontSize: '0.9rem',
                            opacity: Math.max(0.2, Math.min(1, opacity)),
                            zIndex: z > 0 ? 20 : 1,
                            transition: 'transfrom 0.03s linear'
                        }}>
                            {w.text}
                        </div>
                    );
                })}
            </div>
            <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={handleAdd}
                placeholder="Type one word..."
                style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '0.8rem',
                    borderRadius: '50px',
                    color: 'white',
                    width: '200px',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    zIndex: 30
                }}
            />
        </GameShell>
    );
};

// --- GAME 4: THOUGHT DROP (REFINED WITH DRAG) ---
export const ThoughtDrop = ({ onBack }) => {
    const [thought, setThought] = useState('');
    const [card, setCard] = useState(null); // { id, text, x, y }
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const voidRef = useRef(null);

    const handleCreate = () => {
        if (!thought.trim()) return;
        setCard({ id: Date.now(), text: thought, x: 0, y: -100 });
        setThought('');
    };

    // Drag Logic
    const handleMouseDown = (e) => {
        if (!card) return;
        setIsDragging(true);
        // Calculate offset from center of card
        // Simplified: just track mouse
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !card) return;
        // In a real app we'd calculate relative to container, 
        // here we simply move the card by delta or track cursor relative to center
        // Let's use a simple relative movement for this demo
        setCard(prev => ({
            ...prev,
            x: prev.x + e.movementX,
            y: prev.y + e.movementY
        }));
    };

    const handleMouseUp = (e) => {
        if (!isDragging) return;
        setIsDragging(false);

        // Check collision with void (Bottom center roughly)
        // Void is around y=150 in the container's interactive zone
        if (card.y > 100) {
            // Drop into void
            setCard(null); // Dissolve
        } else {
            // Spring back
            setCard(prev => ({ ...prev, x: 0, y: -50 }));
        }
    };

    return (
        <GameShell title="Thought Drop" onBack={onBack}>
            <div className="game-subtitle" style={{ marginBottom: '1rem' }}>Drag your worry into the void.</div>
            <div className="interactive-zone" style={{ flexDirection: 'column', overflow: 'hidden', width: '100%', position: 'relative' }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>

                {/* VOID */}
                <div ref={voidRef} style={{
                    position: 'absolute',
                    bottom: '-50px',
                    width: '200px',
                    height: '100px',
                    background: 'radial-gradient(ellipse at center, #000 0%, transparent 70%)',
                    boxShadow: '0 0 50px rgba(0,0,0,0.8) inset',
                    borderRadius: '50%',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.8rem'
                }}>
                    RELEASE HERE
                </div>

                {/* CARD */}
                {card && (
                    <div
                        onMouseDown={handleMouseDown}
                        style={{
                            position: 'absolute',
                            transform: `translate(${card.x}px, ${card.y}px)`,
                            background: 'white',
                            color: '#1e293b',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            maxWidth: '220px',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                            zIndex: 10,
                            userSelect: 'none',
                            transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {card.text}
                    </div>
                )}

                {!card && <div style={{ opacity: 0.5, marginTop: '2rem' }}>The mind is clear.</div>}

            </div>

            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '300px', zIndex: 20 }}>
                <input
                    type="text"
                    value={thought}
                    onChange={(e) => setThought(e.target.value)}
                    placeholder="Type a heavy thought..."
                    disabled={!!card}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'None',
                        padding: '0.8rem',
                        borderRadius: '12px',
                        color: 'white',
                        flex: 1
                    }}
                />
                <button className="soft-btn" style={{ marginTop: 0 }} onClick={handleCreate} disabled={!!card}>Create</button>
            </div>
        </GameShell>
    );
};

// --- GAME 5: SAFE PLACE BUILDER ---
export const SafePlaceBuilder = ({ onBack }) => {
    const [bg, setBg] = useState('linear-gradient(to top, #0f172a, #1e293b)');
    const [element, setElement] = useState(null);

    return (
        <GameShell title="Safe Place" onBack={onBack}>
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: bg, transition: 'background 1.5s ease', zIndex: -1
            }} />

            <div className="interactive-zone">
                {element === 'rain' && (
                    <div style={{ width: '100%', height: '100%', position: 'absolute', background: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjEwIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI1IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=") repeat', animation: 'rain 1s linear infinite' }}></div>
                )}
                {element === 'stars' && (
                    <div style={{ fontSize: '3rem', opacity: 0.8, filter: 'blur(1px)' }}>✨ .  *  . ✨</div>
                )}
                {element === 'forest' && (
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '50%', background: 'linear-gradient(to top, #064e3b, transparent)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ fontSize: '5rem', opacity: 0.3, marginBottom: '-1rem' }}>🌲🌲🌲</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
                <button className="soft-btn" onClick={() => { setBg('linear-gradient(to top, #020617, #1e1b4b)'); setElement('stars'); }}>🌌 Space</button>
                <button className="soft-btn" onClick={() => { setBg('linear-gradient(to top, #334155, #64748b)'); setElement('rain'); }}>🌧️ Rain</button>
                <button className="soft-btn" onClick={() => { setBg('linear-gradient(to top, #064e3b, #15803d)'); setElement('forest'); }}>🌲 Forest</button>
            </div>

            <style>{`
                @keyframes rain { from { background-position: 0 0; } to { background-position: 0 100px; } }
            `}</style>
        </GameShell>
    );
};

// --- GAME 6: EMOTION SLIDER ---
export const EmotionSlider = ({ onBack }) => {
    const [val, setVal] = useState(50);

    // Calculate color based on val (Red -> Purple -> Blue)
    // 0 = Heavy (Dark Red/Brown), 100 = Light (Cyan/White)
    const bgCol = `hsl(${220 + (val / 100) * 40}, ${50 + (val / 100) * 20}%, ${20 + (val / 100) * 30}%)`;

    return (
        <GameShell title="Emotion Slider" onBack={onBack}>
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: bgCol, transition: 'background 0.2s', zIndex: -1
            }} />

            <div className="interactive-zone" style={{ flexDirection: 'column' }}>
                <div style={{ fontSize: '2rem', marginBottom: '3rem', fontWeight: '300', opacity: 0.9 }}>
                    {val < 30 ? "Heavy..." : val > 70 ? "Light..." : "Neutral"}
                </div>

                <div style={{ width: '80%', position: 'relative' }}>
                    <input
                        type="range"
                        min="0" max="100"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        style={{ width: '100%', cursor: 'grab', accentColor: 'white' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                        <span>Heavy</span>
                        <span>Light</span>
                    </div>
                </div>
            </div>
        </GameShell>
    );
};

// --- GAME 7: UNFINISHED SENTENCE ---
export const UnfinishedSentence = ({ onBack }) => {
    const prompts = ["Right now, I choose to...", "I am grateful for...", "I forgive myself for...", "I release the need to..."];
    const [idx, setIdx] = useState(0);
    const [text, setText] = useState('');

    return (
        <GameShell title="Unfinished Sentence" onBack={onBack}>
            <div className="interactive-zone" style={{ flexDirection: 'column' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: '#e2e8f0', textAlign: 'center', opacity: 0.9 }}>
                    {prompts[idx]}
                </div>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    autoFocus
                    placeholder="..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '2px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        fontSize: '1.2rem',
                        textAlign: 'center',
                        width: '80%',
                        outline: 'none',
                        paddingBottom: '0.5rem'
                    }}
                />
            </div>
            <button className="soft-btn" onClick={() => { setIdx((idx + 1) % prompts.length); setText(''); }}>New Prompt</button>
        </GameShell>
    );
};

// --- GAME 8: BODY MAP ---
export const BodyMapTouch = ({ onBack }) => {
    const [points, setPoints] = useState([]);

    const addPoint = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPoints([...points, { x, y }]);
    };

    return (
        <GameShell title="Body Map" onBack={onBack}>
            <div className="game-subtitle" style={{ marginBottom: '1rem' }}>Tap where you feel tension.</div>
            <div className="interactive-zone">
                <div style={{
                    width: '160px', height: '320px',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '80px',
                    position: 'relative',
                    cursor: 'crosshair',
                    background: 'rgba(255,255,255,0.02)'
                }} onClick={addPoint}>
                    {/* Abstract Head */}
                    <div style={{ position: 'absolute', top: '-40px', left: '40px', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }}></div>

                    {points.map((p, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: p.x - 15, top: p.y - 15,
                            width: '30px', height: '30px',
                            background: 'radial-gradient(circle, #f87171 0%, transparent 70%)',
                            borderRadius: '50%',
                            opacity: 0.8,
                            animation: 'pulse-soft 2s infinite',
                            pointerEvents: 'none'
                        }} />
                    ))}
                </div>
            </div>
            <button className="soft-btn" onClick={() => setPoints([])}>Clear Map</button>
        </GameShell>
    );
};

// --- GAME 9: YES / NOT YET ---
export const YesNotYet = ({ onBack }) => {
    const [choice, setChoice] = useState(null);

    return (
        <GameShell title="Simple Choice" onBack={onBack}>
            <div className="interactive-zone" style={{ gap: '2rem' }}>
                {choice ? (
                    <div style={{ fontSize: '1.5rem', animation: 'fadeIn 1s', textAlign: 'center', lineHeight: '1.5' }}>
                        {choice === 'yes' ? "That is a brave choice.\nBreathe." : "That is okay.\nWe can wait."}
                        <br />
                        <button className="soft-btn" style={{ marginTop: '2rem' }} onClick={() => setChoice(null)}>Reset</button>
                    </div>
                ) : (
                    <>
                        <div
                            onClick={() => setChoice('yes')}
                            className="choice-card"
                            style={{
                                width: '120px', height: '180px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '20px', cursor: 'pointer',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.3s ease',
                                fontSize: '1.2rem', fontWeight: 'bold'
                            }}>
                            YES
                        </div>
                        <div
                            onClick={() => setChoice('no')}
                            className="choice-card"
                            style={{
                                width: '120px', height: '180px',
                                background: 'rgba(168, 85, 247, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '20px', cursor: 'pointer',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                transition: 'all 0.3s ease',
                                fontSize: '1.2rem', fontWeight: 'bold'
                            }}>
                            NOT YET
                        </div>
                    </>
                )}
            </div>
        </GameShell>
    );
};

// --- GAME 10: NIGHT SKY JOURNAL ---
export const NightSkyJournal = ({ onBack }) => {
    const [entries, setEntries] = useState([]);
    const [text, setText] = useState('');

    const addEntry = () => {
        if (!text.trim()) return;
        setEntries([...entries, { text, x: Math.random() * 90, y: Math.random() * 80, size: Math.random() * 0.5 + 0.5 }]);
        setText('');
    };

    return (
        <GameShell title="Night Sky Journal" onBack={onBack}>
            <div className="interactive-zone" style={{ width: '100%', position: 'relative' }}>
                {/* Background Stars */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.3, pointerEvents: 'none' }}>
                    {[...Array(20)].map((_, i) => <div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: '2px', height: '2px', background: 'white' }}></div>)}
                </div>

                {entries.map((e, i) => (
                    <div key={i} title={e.text} style={{
                        position: 'absolute',
                        left: `${e.x}%`, top: `${e.y}%`,
                        fontSize: `${e.size}rem`, color: 'white',
                        animation: 'pulse-soft 3s infinite',
                        cursor: 'help',
                        textShadow: '0 0 10px white'
                    }}>
                        ★
                    </div>
                ))}
            </div>

            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write freely..."
                    style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: 'white',
                        padding: '0.5rem',
                        resize: 'none',
                        height: '60px'
                    }}
                />
                <button className="soft-btn" style={{ marginTop: 0 }} onClick={addEntry}>Send</button>
            </div>
        </GameShell>
    );
};
