
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- State Management ---
const state = {
  apiKey: localStorage.getItem('mindease_key') || '',
  isTalkLessMode: false,
  messages: [],
  crisisKeywords: ['hurt myself', 'end it all', 'suicide', 'self-harm', 'kill myself', 'don\'t want to live'],
  currentTask: null,
};

// --- DOM Elements ---
const chatWidget = document.getElementById('chat-widget');
const toggleChatBtn = document.getElementById('toggle-chat');
const chatContainer = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const vibeText = document.getElementById('vibe-text');
const vibeDot = document.querySelector('.vibe-dot');
const moodCards = document.querySelectorAll('.mood-card');
const actionButtons = document.querySelectorAll('.action-btn');
const apiKeyInput = document.getElementById('api-key-input');
const saveKeyBtn = document.getElementById('save-key-btn');

// --- AI Setup ---
const SYSTEM_PROMPT = `
You are MindEase, an Action-Bridge agent.
Your ONLY goal is to bridge the gap between what the user is thinking/feeling and what they are able to do right now.

PERSONA:
- Calm, grounded, emotionally aware human.
- Focus on PRECISION and FRICTION REDUCTION.
- No sugar-coating, no toxic positivity, no motivation pushes.
- Do NOT give long advice or coping technique dumps.

WORKFLOW:
1. Acknowledge emotion/venting with 1 honest, realistic sentence.
2. Immediately translate that into ONE TINY ACTION (≤ 2 minutes).
3. If the user completes the action, acknowledge it briefly ("That mattered.") and wait.
4. If they are stuck, suggest a smaller grounding task.

CONSTRAINTS:
- Keep responses short (1-3 sentences).
- One idea at a time.
- Avoid: "Everything will be okay", "Just stay positive", "You're strong, you'll manage".
- If distress is severe, suggest professional help gently and stop.
`;

// --- Initialization ---
function init() {
  if (state.apiKey) {
    apiKeyInput.value = '********';
  }

  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key && key !== '********') {
      localStorage.setItem('mindease_key', key);
      state.apiKey = key;
      alert('API Key saved!');
    }
  });

  moodCards.forEach(card => {
    card.addEventListener('click', () => {
      const mood = card.getAttribute('data-mood');
      selectMood(mood);
      openChat();
    });
  });

  actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.innerText.trim();
      processInput(`I want to ${action}`);
      openChat();
    });
  });

  toggleChatBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleChat();
  });

  chatWidget.addEventListener('click', () => {
    if (chatWidget.classList.contains('minimized')) openChat();
  });

  addMessage('MindEase', "I'm MindEase. If you're stuck or overloaded, I'm here to help you move forward, one tiny step at a time. Pick a mood or just start venting.", 'ai');
}

// --- Chat Functions ---
function toggleChat() {
  chatWidget.classList.toggle('minimized');
  toggleChatBtn.innerText = chatWidget.classList.contains('minimized') ? 'Open' : 'Minimize';
}

function openChat() {
  chatWidget.classList.remove('minimized');
  toggleChatBtn.innerText = 'Minimize';
}

function addMessage(sender, text, type) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${type}-message`;
  msgDiv.innerHTML = `
    <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-bottom: 2px;">${sender}</div>
    <div style="padding: 10px 15px; border-radius: 15px; background: ${type === 'ai' ? 'rgba(255,255,255,0.05)' : '#38bdf8'}; color: ${type === 'ai' ? '#fff' : '#000'}; border: ${type === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
      ${text}
    </div>
  `;
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  state.messages.push({ role: type === 'ai' ? 'model' : 'user', parts: [{ text }] });
}

function selectMood(moodLabel) {
  state.currentMood = moodLabel;
  vibeText.textContent = moodLabel;
  const colors = { 'Overwhelmed': '#f87171', 'Anxious': '#fbbf24', 'Burnt Out': '#818cf8', 'Low': '#94a3b8' };
  vibeDot.style.background = colors[moodLabel] || '#38bdf8';
  processInput(`I'm feeling ${moodLabel}`);
}

async function processInput(text) {
  addMessage('Friend', text, 'user');

  if (checkCrisis(text)) return;

  if (!state.apiKey) {
    addMessage('MindEase', "Please enter your Gemini API Key in the footer to start the Action-Bridge.", 'ai');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(state.apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SYSTEM_PROMPT });

    // Filter out initial MindEase greeting for history
    const history = state.messages.map(m => ({ role: m.role, parts: m.parts }));
    const chat = model.startChat({ history });

    const result = await chat.sendMessage(text);
    const response = await result.response;
    addMessage('MindEase', response.text(), 'ai');
  } catch (error) {
    console.error(error);
    addMessage('MindEase', "I lost the connection. Maybe verify your API key?", 'ai');
  }
}

function checkCrisis(text) {
  const lowerText = text.toLowerCase();
  if (state.crisisKeywords.some(keyword => lowerText.includes(keyword))) {
    addMessage('MindEase', "That sounds incredibly hard. I'm an AI, but I want you to know you don't have to carry this alone. Please reach out to [988] or a trusted human who can sit with you.", 'ai');
    return true;
  }
  return false;
}

function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  processInput(text);
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

init();

