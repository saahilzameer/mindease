import React, { useState, useEffect, useRef } from 'react';
import WellnessBox from './components/WellnessBox';
import WellnessDashboard from './components/WellnessDashboard';

const App = () => {
    const [messages, setMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isWellnessBoxOpen, setIsWellnessBoxOpen] = useState(false);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [vibe, setVibe] = useState({ label: 'Checking in...', color: '#38bdf8' });
    const chatEndRef = useRef(null);

    // Tracking state
    const [actionLog, setActionLog] = useState(() => {
        const saved = localStorage.getItem('mindease_actions');
        return saved ? JSON.parse(saved) : [];
    });
    const [wellnessUsage, setWellnessUsage] = useState(() => {
        const saved = localStorage.getItem('mindease_wellness');
        return saved ? JSON.parse(saved) : { breathing: 0, grounding: 0, patterns: 0, movement: 0 };
    });
    const [realityChecks, setRealityChecks] = useState(() => {
        const saved = localStorage.getItem('mindease_reality');
        return saved ? JSON.parse(saved) : [];
    });

    // Save tracking data
    useEffect(() => {
        localStorage.setItem('mindease_actions', JSON.stringify(actionLog));
    }, [actionLog]);

    useEffect(() => {
        localStorage.setItem('mindease_wellness', JSON.stringify(wellnessUsage));
    }, [wellnessUsage]);

    useEffect(() => {
        localStorage.setItem('mindease_reality', JSON.stringify(realityChecks));
    }, [realityChecks]);

    const moods = [
        { label: 'Overwhelmed', emoji: '🤯', color: '#f87171' },
        { label: 'Anxious', emoji: '😰', color: '#fbbf24' },
        { label: 'Burnt Out', emoji: '🫠', color: '#818cf8' },
        { label: 'Low', emoji: '😔', color: '#94a3b8' }
    ];

    const actionButtons = [
        { label: 'Build Exam Strategy', icon: '📖' },
        { label: 'Instant Panic Relief', icon: '🌬️' },
        { label: 'Analyze My Brain Dump', icon: '📊' }
    ];

    useEffect(() => {
        if (messages.length === 0) {
            addAiMessage("Hey. I'm MindEase. If you're stuck or overloaded, I'm here. Pick a mood above, or just tell me what's happening.");
        }
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    const addAiMessage = (text) => {
        setMessages(prev => [...prev, { role: 'model', parts: [{ text }], sender: 'MindEase' }]);
    };

    const addUserMessage = (text) => {
        setMessages(prev => [...prev, { role: 'user', parts: [{ text }], sender: 'Friend' }]);
    };

    const logAction = (action, type = 'micro-action') => {
        setActionLog(prev => [...prev, { action, timestamp: new Date().toISOString(), type }]);
    };

    const handleMoodSelect = (mood) => {
        setVibe({ label: mood.label, color: mood.color });
        setIsChatOpen(true);
        logAction(`Selected mood: ${mood.label}`, 'mood');
        processInput(`I'm feeling ${mood.label}`);
    };

    const handleActionClick = (action) => {
        setIsChatOpen(true);
        processInput(`I want to ${action.label}`);
    };

    const handleRealityCheck = () => {
        const check = "Let's do a reality check. What's one thing you know for certain right now?";
        addAiMessage(check);
        setRealityChecks(prev => [...prev, { text: check, timestamp: new Date().toISOString() }]);
        setIsChatOpen(true);
    };

    const processInput = async (text) => {
        if (!text.trim()) return;

        // Add user message
        if (!text.startsWith("I'm feeling") && !text.startsWith('I want to')) {
            addUserMessage(text);
        } else {
            addUserMessage(text);
        }

        if (checkCrisis(text)) return;

        // Rule-based responses following Action-Bridge persona
        setTimeout(() => {
            const lowerText = text.toLowerCase();
            let response = "";
            let suggestedAction = null;

            // Direct requests for suggestions - PRIORITY
            if (lowerText.includes("suggest") || lowerText.includes("what should i") ||
                lowerText.includes("give me something") || lowerText.includes("help me") ||
                lowerText.includes("what can i do") || lowerText.includes("any ideas")) {
                const microActions = [
                    "Drink one glass of water. Right now.",
                    "Walk to a window. Look outside for 30 seconds.",
                    "Open your notes. Type one sentence about what you feel. Don't edit.",
                    "Set a timer for 60 seconds. Just breathe.",
                    "Text someone 'Hey.' Just that.",
                    "Splash cold water on your face.",
                    "Write three things you can see. Nothing deep, just what's there.",
                    "Put on one song. Let it play.",
                    "Lie down for 2 minutes. Set a timer.",
                    "Stand up. Sit down. That's it."
                ];
                response = microActions[Math.floor(Math.random() * microActions.length)];
                suggestedAction = response;
            }
            // Acknowledgment of completion
            else if (lowerText.includes("did it") || lowerText.includes("done") || lowerText.includes("finished")) {
                const acknowledgments = [
                    "That mattered. Not because it fixed everything, but because you moved.",
                    "You did that when it was hard. That counts.",
                    "Notice anything different in your body? Even something small?"
                ];
                response = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
                logAction("Completed a suggested action", 'micro-action');
            }
            // Feeling stuck - identify thinking-action gap
            else if (lowerText.includes("stuck") || lowerText.includes("can't move") || lowerText.includes("paralyzed")) {
                response = "Your mind is going but your body isn't. That gap is real. Wiggle your toes for 5 seconds—just to prove to yourself you can still move something.";
                suggestedAction = "Wiggle toes for 5 seconds";
            }
            // Overwhelmed - acknowledge and bridge
            else if (lowerText.includes("overwhelmed") || text.includes("Overwhelmed")) {
                response = "That weight is real. Everything at once is too much. One breath, four counts in, four counts out. Can you do one?";
                suggestedAction = "One breath (4-4)";
            }
            // Anxious - validate without fixing
            else if (lowerText.includes("anxious") || text.includes("Anxious")) {
                response = "Uncertainty is exhausting. You don't need to calm down right now. Name one thing you see, one thing you touch. Out loud if you can.";
                suggestedAction = "Name one thing you see and touch";
            }
            // Burnt out - honor exhaustion
            else if (lowerText.includes("burnt out") || lowerText.includes("burned out") || text.includes("Burnt Out")) {
                response = "You've been running on empty. Close your eyes for 30 seconds. Nothing more.";
                suggestedAction = "Close eyes for 30 seconds";
            }
            // Low/down - sit with it
            else if (lowerText.includes("low") || lowerText.includes("down") || text.includes("Low")) {
                response = "I hear that heaviness. I'm not going to tell you it'll get better. Take one sip of water. Just one.";
                suggestedAction = "One sip of water";
            }
            // Exam/study pressure
            else if (lowerText.includes("exam") || lowerText.includes("study")) {
                response = "The pressure is draining you. Don't study. Just open one page and look at it for 30 seconds. That's all.";
                suggestedAction = "Look at one page for 30 seconds";
            }
            // Panic - ride it out
            else if (lowerText.includes("panic") || lowerText.includes("relief")) {
                response = "Panic moves through. You ride it. Find one thing you see. Say it out loud. Then one thing you touch.";
                suggestedAction = "Name what you see and touch";
            }
            // Water/drink mentioned - affirm
            else if (lowerText.includes("water") || lowerText.includes("drink")) {
                response = "Good. One sip at a time.";
                logAction("Drank water", 'micro-action');
            }
            // Breathing mentioned
            else if (lowerText.includes("breathe") || lowerText.includes("breathing")) {
                response = "Breathing is proof you're here. Try the Wellness Box if you want structure, or just breathe however feels right.";
                suggestedAction = "Open Wellness Box breathing";
            }
            // Existential thoughts
            else if (lowerText.includes("point") || lowerText.includes("why bother") || lowerText.includes("what's the use")) {
                response = "Sometimes there is no point. That's okay to feel. But you're still here, and that counts for something.";
            }
            // Tired/exhausted
            else if (lowerText.includes("tired") || lowerText.includes("exhausted")) {
                response = "You need rest, not self-care. Lie down for 2 minutes. Set a timer.";
                suggestedAction = "Lie down for 2 minutes";
            }
            // Can't sleep
            else if (lowerText.includes("sleep") || lowerText.includes("insomnia")) {
                response = "Your mind won't stop. Don't fight it. Just notice your breath. Count to 4 on the inhale, 4 on the exhale. Do three rounds.";
                suggestedAction = "Three breathing rounds (4-4)";
            }
            // Asking "why" - validate not explain
            else if (lowerText.includes("why do i") || lowerText.includes("why can't i")) {
                response = "You're looking for reasons when what you need is a step. It's okay not to know why. What's one tiny thing your body can do right now?";
            }
            // Default - offer choice without pressure
            else {
                response = "I hear you. That's heavy. Do you want one small thing to try (say 'suggest'), or do you need to vent more first?";
            }

            addAiMessage(response);

            // Log suggested actions
            if (suggestedAction) {
                logAction(suggestedAction, 'suggested');
            }
        }, 800);
    };

    const checkCrisis = (text) => {
        const keywords = ['hurt myself', 'end it all', 'suicide', 'self-harm', 'kill myself', 'don\'t want to live'];
        if (keywords.some(k => text.toLowerCase().includes(k))) {
            addAiMessage("That sounds incredibly hard. I'm an AI, but I want you to know you don't have to carry this alone. Please reach out to [988] or a trusted human who can sit with you.");
            return true;
        }
        return false;
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const text = inputValue;
        setInputValue('');
        processInput(text);
    };

    return (
        <div id="app">
            <header className="top-header">
                <div className="header-left">
                    <h1 className="logo-text">MindEase</h1>
                    <p className="slogan">When your mind is overloaded, we think for you.</p>
                </div>
                <div className="header-right">
                    <button className="pill-btn secondary" onClick={() => setIsWellnessBoxOpen(true)}>
                        <span className="icon">🤍</span> Wellness Box
                    </button>
                    <button className="pill-btn secondary" onClick={() => setIsDashboardOpen(true)}>
                        <span className="icon">📊</span> Dashboard
                    </button>
                    <button className="pill-btn primary" onClick={handleRealityCheck}>
                        Reality Check
                    </button>
                </div>
            </header>

            <main className="content-center">
                <h2 className="main-heading">Ready to face the day, or dreading it?</h2>

                <div className="mood-grid">
                    {moods.map(mood => (
                        <div key={mood.label} className="mood-card" onClick={() => handleMoodSelect(mood)}>
                            <div className="mood-emoji">{mood.emoji}</div>
                            <span className="mood-label">{mood.label}</span>
                        </div>
                    ))}
                </div>

                <div className="agent-ready-section">
                    <p className="agent-status-text">MINDEASE AGENT IS READY</p>
                    <div className="action-buttons">
                        {actionButtons.map(btn => (
                            <button key={btn.label} className="action-btn" onClick={() => handleActionClick(btn)}>
                                <span className="icon">{btn.icon}</span> {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="bottom-footer">
                <p className="disclaimer">Powered by MindEase • Not a replacement for professional therapy</p>
                <p className="vent-prompt">Can't type? Just vent. I'm listening.</p>
            </footer>

            {/* Chat Widget */}
            <div className={`chat-widget ${!isChatOpen ? 'minimized' : ''}`} onClick={() => !isChatOpen && setIsChatOpen(true)}>
                <div className="chat-header">
                    <span>MindEase Assistant</span>
                    <button onClick={(e) => { e.stopPropagation(); setIsChatOpen(false); }}>
                        {isChatOpen ? 'Minimize' : 'Open'}
                    </button>
                </div>
                <div className="chat-container">
                    {messages.map((m, i) => (
                        <div key={i} className={`message ${m.role === 'user' ? 'user-message' : 'ai-message'}`}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>{m.sender}</div>
                            <div style={{
                                padding: '10px 15px',
                                borderRadius: '15px',
                                background: m.role === 'model' ? 'rgba(255,255,255,0.05)' : '#38bdf8',
                                color: m.role === 'model' ? '#fff' : '#000',
                                border: m.role === 'model' ? '1px solid rgba(255,255,255,0.1)' : 'none'
                            }}>
                                {m.parts[0].text}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <div className="chat-input-area" onClick={(e) => e.stopPropagation()}>
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Just vent. I'm listening..."
                    />
                    <button onClick={handleSend} id="send-btn">➡️</button>
                </div>
                <div className="vibe-indicator-mini">
                    <div className="vibe-dot" style={{ background: vibe.color }}></div>
                    <span id="vibe-text">{vibe.label}</span>
                </div>
            </div>

            {isWellnessBoxOpen && (
                <WellnessBox
                    onClose={() => setIsWellnessBoxOpen(false)}
                    onActivityComplete={(activity) => {
                        setWellnessUsage(prev => ({ ...prev, [activity]: prev[activity] + 1 }));
                        logAction(`Completed ${activity} exercise`, 'wellness');
                    }}
                />
            )}

            {isDashboardOpen && (
                <WellnessDashboard
                    onClose={() => setIsDashboardOpen(false)}
                    actionLog={actionLog}
                    wellnessUsage={wellnessUsage}
                    realityChecks={realityChecks}
                />
            )}
        </div>
    );
};

export default App;
