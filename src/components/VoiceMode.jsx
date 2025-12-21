import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import RecoveryMode from './RecoveryMode';

const VoiceMode = ({ isOpen, onClose, systemPrompt, activeMode, allModes, onSelectMode, currentMoodState }) => {
    // Session State
    const [hasStarted, setHasStarted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [aiReady, setAiReady] = useState(false);

    // UI State
    const [status, setStatus] = useState('Ready to connect.');
    const [transcript, setTranscript] = useState('');
    const [lastAiResponse, setLastAiResponse] = useState('');
    const [debugLogs, setDebugLogs] = useState([]);
    const [isRecoveryActive, setIsRecoveryActive] = useState(false);
    const [lastFailedAction, setLastFailedAction] = useState(null);

    // Refs
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const chatSessionRef = useRef(null);
    const isSessionActive = useRef(false);

    // --- LOGGING HELPER ---
    const log = (msg) => {
        const time = new Date().toLocaleTimeString().split(' ')[0];
        const entry = `[${time}] ${msg}`;
        console.log(entry);
        setDebugLogs(prev => [entry, ...prev].slice(0, 50));
    };

    // --- COMPONENT LIFECYCLE ---
    useEffect(() => {
        if (isOpen) {
            log("--- SESSION OPENED ---");
            resetSession();
        } else {
            stopEverything();
        }
        return () => stopEverything();
    }, [isOpen]);

    const resetSession = () => {
        setHasStarted(false);
        setIsListening(false);
        setIsSpeaking(false);
        setAiReady(false);
        setStatus("Waiting for Start...");
        setTranscript('');
        setLastAiResponse('');
        isSessionActive.current = false;
    };

    const stopEverything = () => {
        log("--- STOPPING SESSION ---");
        isSessionActive.current = false;

        // Stop Mic
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }

        // Stop TTS
        if (synthRef.current) {
            synthRef.current.cancel();
        }

        setIsListening(false);
        setIsSpeaking(false);
    };

    // --- MAIN START FLOW ---
    const handleStartWithMode = async (mode) => {
        onSelectMode(mode);
        // The rest of the startup will happen via handleStartSession or automatically
        // but to keep it simple, we'll trigger the session start here too
        handleStartSession();
    };

    const handleStartSession = async () => {
        setHasStarted(true);
        isSessionActive.current = true;
        log("User Clicked START");
        setStatus("Initializing...");

        // 1. Try Initialize Gemini (Non-blocking)
        await initGemini();

        // 2. Initialize Voice (Mandatory)
        const micOk = initSpeechRecognition();

        if (micOk) {
            // 3. Start Conversation
            triggerGreeting();
        } else {
            setLastFailedAction({ type: 'mic' });
            setIsRecoveryActive(true);
            log("CRITICAL: Mic init failed");
        }
    };

    // --- PART 1: GEMINI INIT ---
    const initGemini = async () => {
        try {
            log("Connecting to Gemini...");
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: systemPrompt
            });

            chatSessionRef.current = model.startChat({ history: [] });
            setAiReady(true);
            log("Gemini Connected (gemini-1.5-flash)");
        } catch (e) {
            log(`GEMINI FAILED: ${e.message}`);
            log("Switching to Offline Fallback Mode");
            setAiReady(false);
            // We do NOT stop execution. Voice must still work.
        }
    };

    // --- PART 2: VOICE INIT (Web Speech API) ---
    const initSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            log("Browser does not support Speech API");
            alert("Sorry, your browser doesn't support Voice Mode. Try Chrome.");
            return false;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN'; // Prioritize Indian English
        recognition.continuous = false; // Stop after one sentence (turn-based)
        recognition.interimResults = false;

        recognition.onstart = () => {
            log("Mic: ON");
            if (isSessionActive.current) {
                setIsListening(true);
                setStatus("Listening...");
            }
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            log(`User said: "${text}"`);
            setTranscript(text);
            handleUserInput(text);
        };

        recognition.onerror = (event) => {
            log(`Mic Error: ${event.error}`);
            setIsListening(false);

            if (event.error === 'not-allowed') {
                setStatus("Permission Denied (Check Browser)");
            } else if (event.error === 'no-speech') {
                // Silent fail/retry logic
                if (isSessionActive.current && !isSpeaking) {
                    log("Silence detected. Retrying...");
                    // Small delay to prevent CPU spinning
                    setTimeout(() => startMic(), 1000);
                }
            } else {
                setLastFailedAction({ type: 'mic' });
                setIsRecoveryActive(true);
            }
        };

        recognition.onend = () => {
            log("Mic: OFF");
            setIsListening(false);
            // Check if we need to restart? 
            // Usually we only restart AFTER AI handles the previous input.
            // If we just stopped without result (handled in onerror usually), or if we got result (handled in onresult)
        };

        recognitionRef.current = recognition;
        return true;
    };

    const startMic = () => {
        if (!isSessionActive.current || isSpeaking) return;

        try {
            recognitionRef.current.start();
        } catch (e) {
            // Probably already started
        }
    };

    // --- PART 3: CONVERSATION LOGIC ---

    // Initial hello
    const triggerGreeting = async () => {
        // State-aware acknowledgments for voice with MANDATORY Format
        const acknowledgments = {
            'Overwhelmed': "That sounds heavy. Let’s take this one step at a time.\n→ What feels hardest right now?",
            'Anxious': "I’m here with you. Let’s slow things down.\n→ Do you want to talk, or should we start with something calming?",
            'Burnt Out': "You’ve been carrying a lot. We’ll keep this gentle.\n→ Where would you like to start today?",
            'Low': "I hear you. We’ll move at your pace.\n→ What is one small thing weighing on you?"
        };

        const stateGreeting = currentMoodState ? acknowledgments[currentMoodState.label] : null;

        // Intent queries for background sync (mirroring App.jsx)
        const stateLabel = currentMoodState ? currentMoodState.label.toLowerCase() : 'overloaded';
        const queries = {
            'strategist': `I want help creating a clear and realistic study plan. I’m feeling ${stateLabel} and need something manageable that I can follow.`,
            'calming': `I’m feeling ${stateLabel} right now. I need help calming my mind and body in the next few minutes.`,
            'organizer': `My thoughts feel messy and crowded. I’m feeling ${stateLabel}. I want help organizing what’s in my head and making it clearer.`
        };

        // If we are in a special mode, use its predefined initial greeting
        if (activeMode) {
            const finalGreeting = stateGreeting ? `${stateGreeting} ${activeMode.initialGreeting}` : activeMode.initialGreeting;
            speak(finalGreeting);

            // SYNC AI Context: Send the intent query silently to Gemini so it's ready for user's next response
            if (aiReady && chatSessionRef.current) {
                try {
                    // We don't speak the response here, we just prime the history
                    const query = queries[activeMode.id] || "I'm ready to start.";
                    await chatSessionRef.current.sendMessage(query);
                    log(`AI Primed with Mode: ${activeMode.id}`);
                } catch (e) {
                    log("AI Context Sync Failed");
                }
            }
            return;
        }

        if (aiReady && chatSessionRef.current) {
            try {
                // Incorporate state into the first AI message trigger
                const prompt = stateGreeting
                    ? `The user is feeling ${currentMoodState.label}. I've already said: "${stateGreeting}". Now say hello briefly and ask how you can help. 
MANDATORY: End your response with a follow-up question on a new line starting with "→".`
                    : `Start conversation. Say hello briefly. 
MANDATORY: End your response with a follow-up question on a new line starting with "→".`;
                const res = await chatSessionRef.current.sendMessage(prompt);
                const text = res.response.text();
                speak(text);
                return;
            } catch (e) {
                log("Greeting Gen Failed, using fallback");
            }
        }

        const fallback = stateGreeting ? stateGreeting : "Hi. I'm MindEase.\n→ How can I help you today?";
        speak(fallback);
    };

    const handleUserInput = async (text) => {
        if (!text.trim()) return;

        // 1. Get AI Response
        let responseText = "";

        if (aiReady && chatSessionRef.current) {
            setStatus("Thinking...");
            // Small random delay for natural pause
            await new Promise(r => setTimeout(r, 600));

            try {
                const result = await chatSessionRef.current.sendMessage(text);
                responseText = result.response.text();
                log("AI Responded");
            } catch (e) {
                log(`AI Gen Error: ${e.message}`);
                setLastFailedAction({ type: 'chat', text });
                setIsRecoveryActive(true);
                responseText = "Let’s keep going. How would you like to continue?";
            }
        } else {
            // Offline / Fallback Mode - No Technical jargon
            log("Using Recovery Mode Trigger");
            setLastFailedAction({ type: 'chat', text });
            setIsRecoveryActive(true);
            responseText = "Let’s keep going. How would you like to continue?";
        }

        setLastAiResponse(responseText);
        speak(responseText);
    };

    // Helper for natural fallbacks
    const getFallbackResponse = () => {
        const fallbacks = [
            "I'm here with you.",
            "Take your time.",
            "Tell me more about that.",
            "What feels hardest right now?",
            "I'm listening.",
            "I'm right here."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    };

    // --- PART 4: TTS (Text to Speech) ---
    const speak = (text) => {
        if (!synthRef.current) return;

        // Cancel anything currently speaking
        synthRef.current.cancel();

        const cleanText = text.replace(/[*#]/g, ''); // Remove MD chars
        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Voice Config
        const voices = synthRef.current.getVoices();
        const outputVoice = voices.find(v => v.name.includes('Google US')) || voices[0];
        if (outputVoice) utterance.voice = outputVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsListening(false); // Ensure mic is off
            setStatus("Speaking...");
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            log("Finished Speaking");

            // AUTOMATICALLY RE-OPEN MIC
            if (isSessionActive.current) {
                setStatus("Waiting for you...");
                setTimeout(() => startMic(), 500);
            }
        };

        synthRef.current.speak(utterance);
    };

    const handleRecoveryAction = (action) => {
        setIsRecoveryActive(false);
        switch (action) {
            case 'retry':
                if (lastFailedAction?.type === 'mic') {
                    handleStartSession();
                } else if (lastFailedAction?.type === 'chat') {
                    handleUserInput(lastFailedAction.text);
                }
                break;
            case 'talk_no_ai':
                setAiReady(false); // Stay in fallback mode
                setStatus("Listener Mode Active");
                speak("I'm still here. Tell me what's on your mind.");
                break;
            case 'instant_calm':
                // For simplicity, we trigger the close and let App handle it, 
                // but usually we'd want to stay in voice.
                // However, the rule says "Opens Box Breathing or Grounding".
                onClose(); // Close voice and let app handle wellness
                break;
            case 'wellness':
                onClose();
                break;
            case 'back':
                onClose();
                break;
            default:
                break;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="voice-overlay">
            {/* TOP BAR */}
            <div className="voice-top-bar">
                <button className="voice-back-btn" onClick={onClose} aria-label="Go back">
                    <span className="back-icon">←</span>
                </button>
                <div className="voice-brand">MindEase</div>
                <div className="top-right-space"></div>
            </div>

            <div className="voice-content">
                {!hasStarted ? (
                    <div className="voice-ready-screen">
                        <div className="agent-ready-header">
                            <h1 className="agent-ready-title">MindEase Agent is Ready</h1>
                            <p className="agent-ready-subtitle">What would you like help with right now?</p>
                        </div>

                        <div className="mode-stack">
                            {Object.values(allModes).map(mode => (
                                <div
                                    key={mode.id}
                                    className={`mode-card ${activeMode?.id && activeMode.id !== mode.id ? 'fade-back' : ''}`}
                                    onClick={() => handleStartWithMode(mode)}
                                >
                                    <div className="mode-icon">{mode.icon}</div>
                                    <div className="mode-info">
                                        <h4 className="mode-title">{mode.title}</h4>
                                        <p className="mode-desc">{mode.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!activeMode && (
                            <div className="voice-action-center" style={{ marginTop: '2rem' }}>
                                <button className="voice-primary-btn" onClick={handleStartSession}>
                                    Just start talking
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="voice-active-session">
                        {/* VISUALIZER (Centered Focal Point) */}
                        <div className="voice-visualizer">
                            <div className={`pulse-circle ${isSpeaking ? 'speaking' : ''} ${isListening ? 'listening' : ''}`}>
                                <div className="inner-glow"></div>
                            </div>
                        </div>

                        {/* TRANSCRIPT (Minimal & Subtle) */}
                        <div className="voice-status-container">
                            <h2 className={`voice-session-status ${status.includes('Error') ? 'error-state' : ''}`}>
                                {status}
                            </h2>
                            <div className="transcript-display">
                                {transcript && <p className="line-user">{transcript}</p>}
                                {lastAiResponse && <p className="line-ai">{lastAiResponse.substring(0, 150)}{lastAiResponse.length > 150 ? '...' : ''}</p>}
                            </div>
                        </div>

                        <div className="voice-footer">
                            <button className="voice-stop-btn" onClick={stopEverything}>
                                End Session
                            </button>
                        </div>
                    </div>
                )}

                {/* DEBUG PANEL - Hidden but accessible if needed */}
                <div className="voice-debug-panel">
                    <div className="debug-header">
                        <span className={`debug-status-pill ${isListening ? 'active' : 'inactive'}`}>
                            MIC: {isListening ? 'ON' : 'OFF'}
                        </span>
                        <span className={`debug-status-pill ${aiReady ? 'active' : 'inactive'}`}>
                            AI: {aiReady ? 'READY' : 'OFFLINE'}
                        </span>
                    </div>
                    <div className="debug-logs">
                        {debugLogs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>

                {isRecoveryActive && (
                    <RecoveryMode
                        onAction={handleRecoveryAction}
                        lastActionLabel={lastFailedAction?.type === 'mic' ? "Try Connecting Again" : "Try Again"}
                    />
                )}
            </div>
        </div>
    );
};

export default VoiceMode;
