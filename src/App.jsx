import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import WellnessBox from './components/WellnessBox';
import WellnessDashboard from './components/WellnessDashboard';
import VoiceMode from './components/VoiceMode';
import RecoveryMode from './components/RecoveryMode';
import Login from './components/Login';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are MindEase Assistant, a calm, emotionally intelligent, and professional wellness companion for students.

CORE PRINCIPLES:
1. Never mention technical systems or limitations.
2. Tone: Calm, supportive, clear, human.

MANDATORY OUTPUT FORMAT:
All responses MUST end with a visible follow-up question.
- The question must be on a NEW LINE at the VERY END.
- The question MUST start with "→".
- There MUST be a question mark "?" at the end.

STRUCTURE:
[Empathy / Acknowledgement]
→ [One clear question]?

LANGUAGE: Detect and match English, Hindi, or Telugu (No mixing).`
});

const VOICE_SYSTEM_PROMPT = `You are MindEase Assistant, a calm, professional, and emotionally intelligent voice companion.

CORE RULES:
1. IMMERSION: Never mention technical states, errors, or offline status.
2. TONE: Calm, supportive, human.
3. MANDATORY FORMAT: All responses MUST end on a NEW LINE with a question starting with "→".
4. LANGUAGE: Match the user's language (English, Hindi, Telugu).

FAILURE PROTOCOL:
If anything fails, say: "I'm right here with you.
→ How would you like to continue?"`;

const AGENT_MODES = {
    strategist: {
        id: 'strategist',
        title: 'Build Exam Strategy',
        desc: 'Create a calm, realistic study plan.',
        icon: '📖',
        systemPrompt: `You are the MindEase Strategist. GOAL: Create a study plan. 
FORMAT: End every response with:
→ [Structured question about the exam]?`,
        initialGreeting: "Okay. Let’s slow this down.\n→ Which exam are you preparing for, and when is it?"
    },
    calming: {
        id: 'calming',
        title: 'Instant Panic Relief',
        desc: 'Feel calmer in the next few minutes.',
        icon: '🌬️',
        systemPrompt: `You are the MindEase Calmer. GOAL: Panic relief.
FORMAT: End every response with:
→ [Question about breathing or continuing]?`,
        initialGreeting: "Alright. Stay with me. Let’s slow your breathing together.\n→ Do you want to try a short breathing exercise now?"
    },
    organizer: {
        id: 'organizer',
        title: 'Analyze My Brain Dump',
        desc: 'Organize messy thoughts into clarity.',
        icon: '📊',
        systemPrompt: `You are the MindEase Organizer. GOAL: Organize thoughts.
FORMAT: End every response with:
→ [Question to prompt more sharing]?`,
        initialGreeting: "I'm ready. Take your time.\n→ Go ahead and share everything that’s on your mind."
    }
};

const App = () => {
    const [messages, setMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isWellnessBoxOpen, setIsWellnessBoxOpen] = useState(false);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [vibe, setVibe] = useState({ label: 'Checking in...', color: '#38bdf8' });
    const [currentMode, setCurrentMode] = useState(null);
    const [isRecoveryActive, setIsRecoveryActive] = useState(false);
    const [isOfflineListener, setIsOfflineListener] = useState(false);
    const [currentMoodState, setCurrentMoodState] = useState(null);
    const [lastFailedAction, setLastFailedAction] = useState(null);
    const [userName, setUserName] = useState(() => localStorage.getItem('mindease_user_name') || '');
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('mindease_user_name'));
    const chatEndRef = useRef(null);
    const chatSessionRef = useRef(null);

    // Initialize Gemini Chat
    useEffect(() => {
        chatSessionRef.current = model.startChat({
            history: [],
        });
    }, []);

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
        AGENT_MODES.strategist,
        AGENT_MODES.calming,
        AGENT_MODES.organizer
    ];

    useEffect(() => {
        if (isLoggedIn && messages.length === 0) {
            addAiMessage(`Hey ${userName}. I'm MindEase. If you're stuck or overloaded, I'm here. Pick a mood above, or just tell me what's happening.\n→ How are you holding up right now?`);
        }
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoggedIn]);

    const handleLogin = (name) => {
        localStorage.setItem('mindease_user_name', name);
        setUserName(name);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('mindease_user_name');
        setUserName('');
        setIsLoggedIn(false);
    };

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
        try {
            setCurrentMoodState(mood);
            setVibe({ label: mood.label, color: mood.color });
            setIsChatOpen(true);
            logAction(`Selected mood: ${mood.label}`, 'mood');

            // Brief acknowledgment in chat with mandatory format
            const acknowledgments = {
                'Overwhelmed': "That sounds heavy. Let’s take this one step at a time.\n→ What feels hardest right now?",
                'Anxious': "I’m here with you. Let’s slow things down.\n→ Do you want to talk, or should we start with something calming?",
                'Burnt Out': "You’ve been carrying a lot. We’ll keep this gentle.\n→ Where would you like to start today?",
                'Low': "I hear you. We’ll move at your pace.\n→ What is one small thing weighing on you?"
            };
            addAiMessage(acknowledgments[mood.label] || "I'm here.\n→ Where should we start?");

        } catch (error) {
            setLastFailedAction({ type: 'mood', mood });
            setIsRecoveryActive(true);
        }
    };

    const handleActionClick = (mode) => {
        try {
            setCurrentMode(mode.id);
            setIsChatOpen(true);
            setMessages([]); // Start fresh for the session

            // Dynamic queries based on actual state but keeping the user's intent language
            const stateLabel = currentMoodState ? currentMoodState.label.toLowerCase() : 'overloaded';
            const queries = {
                'strategist': `I want help creating a clear and realistic study plan. I’m feeling ${stateLabel} and need something manageable that I can follow.`,
                'calming': `I’m feeling ${stateLabel} right now. I need help calming my mind and body in the next few minutes.`,
                'organizer': `My thoughts feel messy and crowded. I’m feeling ${stateLabel}. I want help organizing what’s in my head and making it clearer.`
            };

            // Initialize new mode-specific session
            const modeModel = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: mode.systemPrompt + `\nUSER NAME: ${userName}` + (currentMoodState ? `\nUSER CURRENT STATE: ${currentMoodState.label}` : "")
            });
            chatSessionRef.current = modeModel.startChat({ history: [] });

            // Trigger the session with the specific query
            processInput(queries[mode.id] || mode.initialGreeting);
            logAction(`Started Mode: ${mode.title}`, 'mode-start');
            setVibe({ label: mode.title, color: '#a855f7' });
        } catch (error) {
            setLastFailedAction({ type: 'mode', mode });
            setIsRecoveryActive(true);
        }
    };

    const handleRealityCheck = () => {
        const check = "Let's do a reality check. What's one thing you know for certain right now?";
        addAiMessage(check);
        setRealityChecks(prev => [...prev, { text: check, timestamp: new Date().toISOString() }]);
        setIsChatOpen(true);
    };

    const processInput = async (text, skipUi = false) => {
        if (!text.trim()) return;

        if (!skipUi) addUserMessage(text);
        if (checkCrisis(text)) return;

        if (isOfflineListener) {
            const fallbacks = [
                "I'm here. Keep going.",
                "That makes sense. Tell me more.",
                "I'm listening. Take your time.",
                "What else is on your mind?",
                "I'm right here with you."
            ];
            const randomRes = fallbacks[Math.floor(Math.random() * fallbacks.length)];
            setTimeout(() => addAiMessage(randomRes), 600);
            return;
        }

        try {
            if (!chatSessionRef.current) {
                chatSessionRef.current = model.startChat({ history: [] });
            }

            const result = await chatSessionRef.current.sendMessage(text);
            const response = await result.response;
            const responseText = response.text();
            addAiMessage(responseText);
        } catch (error) {
            console.error("Gemini Error:", error);
            // Hide technical details from user
            setLastFailedAction({ type: 'chat', text });
            setIsRecoveryActive(true);
        }
    };

    const handleRecoveryAction = (action) => {
        setIsRecoveryActive(false);

        switch (action) {
            case 'retry':
                setIsOfflineListener(false);
                if (lastFailedAction?.type === 'chat') {
                    // Use skipUi=true on retry to avoid duplicate bubbles
                    processInput(lastFailedAction.text, true);
                } else if (lastFailedAction?.type === 'mode') {
                    handleActionClick(lastFailedAction.mode);
                } else if (lastFailedAction?.type === 'mood') {
                    handleMoodSelect(lastFailedAction.mood);
                }
                break;
            case 'talk_no_ai':
                setIsOfflineListener(true);
                addAiMessage("I'm right here with you. Let’s keep going. How would you like to continue?");
                setIsChatOpen(true);
                break;
            case 'instant_calm':
                setIsWellnessBoxOpen(true);
                break;
            case 'wellness':
                setIsWellnessBoxOpen(true);
                break;
            case 'back':
                setIsChatOpen(false);
                setIsRecoveryActive(false);
                break;
            default:
                break;
        }
    };

    const toggleVoiceMode = () => {
        setIsVoiceMode(!isVoiceMode);
        if (!isVoiceMode) {
            setIsChatOpen(false); // Close chat panel when entering voice mode
        }
    };

    const getVoiceSystemPrompt = () => {
        const base = VOICE_SYSTEM_PROMPT;
        if (currentMode && AGENT_MODES[currentMode]) {
            return `${base}\n\nCURRENT MODE ACTIVE: ${AGENT_MODES[currentMode].title}\n${AGENT_MODES[currentMode].systemPrompt}`;
        }
        return base;
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
            {!isLoggedIn && <Login onLogin={handleLogin} />}
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h1>MindEase</h1>
                    <p className="sidebar-slogan">Clarity for your mind, focus for your day.</p>
                </div>

                <nav className="nav-group">
                    <button className={`nav-item ${!isWellnessBoxOpen && !isDashboardOpen ? 'active' : ''}`} onClick={() => { setIsWellnessBoxOpen(false); setIsDashboardOpen(false); }}>
                        <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        <span>Home</span>
                    </button>
                    <button className={`nav-item ${isWellnessBoxOpen ? 'active' : ''}`} onClick={() => setIsWellnessBoxOpen(true)}>
                        <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        <span>Wellness</span>
                    </button>
                    <button className={`nav-item ${isDashboardOpen ? 'active' : ''}`} onClick={() => setIsDashboardOpen(true)}>
                        <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8l4 4-4 4M8 12h7" /></svg>
                        <span>Evolution</span>
                    </button>
                    <button className="nav-item" onClick={handleRealityCheck}>
                        <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        <span>Check-in</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="reset-name-btn" onClick={handleLogout}>
                        <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        <span>Reset Name</span>
                    </button>
                </div>
            </aside>

            {/* Main Stage */}
            <main className="main-stage">
                {/* Global Top Bar */}
                <header className="main-top-bar">
                    <div className="top-bar-left">
                        {/* Empty or context-specific back button would go here if needed */}
                    </div>
                    <div className="top-bar-center">
                        <span className="section-name">Home</span>
                    </div>
                    <div className="top-bar-right">
                        <div className="gemini-badge">
                            <div className="gemini-icon"></div>
                            <span>Gemini AI</span>
                        </div>
                    </div>
                </header>

                <section className="stage-header">
                    <h2>Ready to face the day, or dreading it?</h2>

                    <div className="search-container">
                        <svg className="search-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="Type a thought or ask for focus..."
                            onKeyDown={(e) => e.key === 'Enter' && (setIsChatOpen(true), processInput(e.target.value))}
                        />
                    </div>

                    <p className="supporting-text">
                        Select your current state to begin a tailored session.
                    </p>
                </section>

                <section className="mood-section">
                    <h3 className="section-title">Current State</h3>
                    <div className="mood-shelf">
                        {moods.map(mood => (
                            <div key={mood.label} className="mood-tile" onClick={() => handleMoodSelect(mood)}>
                                <div className="emoji">{mood.emoji}</div>
                                <span>{mood.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="agent-ready-section">
                    <div className="agent-ready-header">
                        <h3 className="agent-ready-title">MindEase Agent is Ready</h3>
                        <p className="agent-ready-subtitle">What would you like help with right now?</p>
                    </div>

                    <div className="mode-stack">
                        {actionButtons.map(mode => (
                            <div
                                key={mode.id}
                                className={`mode-card ${currentMode && currentMode !== mode.id ? 'fade-back' : ''}`}
                                onClick={() => handleActionClick(mode)}
                            >
                                <div className="mode-icon">{mode.icon}</div>
                                <div className="mode-info">
                                    <h4 className="mode-title">{mode.title}</h4>
                                    <p className="mode-desc">{mode.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="main-footer">
                    <p>MindEase &bull; Built for clarity and calm &bull; Professional support is advised for severe distress.</p>
                </footer>
            </main>

            {/* Chat Toggle Button */}
            {!isChatOpen && (
                <button className="chat-toggle" onClick={() => setIsChatOpen(true)}>
                    💬
                </button>
            )}

            {/* Integrated Chat Panel */}
            <aside className={`chat-panel ${isChatOpen ? 'open' : ''}`}>
                <div className="chat-panel-header">
                    <h3>MindEase Assistant</h3>
                    <button className="close-panel" onClick={() => setIsChatOpen(false)}>✕</button>
                </div>

                <div className="chat-feed">
                    {messages.map((m, i) => (
                        <div key={i} className={`msg-wrapper ${m.role === 'user' ? 'user' : 'ai'}`}>
                            <span className="msg-sender">{m.sender}</span>
                            <div className="msg-bubble">
                                {m.parts[0].text}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="chat-input-wrapper">
                    <div className="chat-input-pill">
                        <button
                            className="voice-trigger-btn"
                            onClick={toggleVoiceMode}
                            title="Speak to MindEase"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginRight: '0.5rem' }}
                        >
                            🎙️
                        </button>
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Just vent. I'm listening..."
                        />
                        <button className="send-action" onClick={handleSend}>
                            ➤
                        </button>
                    </div>
                    <div className="vibe-chip">
                        <div className="vibe-dot" style={{ background: vibe.color }}></div>
                        <span>Vibe: {vibe.label}</span>
                    </div>
                </div>
            </aside>

            {/* Voice Mode Overlay */}
            <VoiceMode
                isOpen={isVoiceMode}
                onClose={() => setIsVoiceMode(false)}
                activeMode={currentMode ? AGENT_MODES[currentMode] : null}
                allModes={AGENT_MODES}
                onSelectMode={(mode) => handleActionClick(mode)}
                systemPrompt={getVoiceSystemPrompt()}
                currentMoodState={currentMoodState}
            />

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
            {/* AI Recovery Mode Overlay */}
            {isRecoveryActive && (
                <RecoveryMode
                    onAction={handleRecoveryAction}
                    lastActionLabel={lastFailedAction?.type === 'retry' ? "Try Again" : "Let’s keep going"}
                />
            )}
        </div>
    );
};

export default App;
