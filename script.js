// ============================================
// J.A.R.V.I.S. - MAIN APPLICATION CONTROLLER
// Production-Grade AI Assistant System
// ============================================

import { JarvisBrain } from './core/brain.js';
import { MemoryManager } from './core/memory.js';
import { IntentProcessor } from './core/intent.js';
import { ResponseGenerator } from './core/reply.js';
import { LearningEngine } from './core/learning.js';
import { EmotionalCore } from './core/emotion.js';
import { VoiceController } from './voice/speech.js';
import { WakeWordDetector } from './voice/wake.js';
import { VisionSystem } from './vision/face.js';
import { TaskManager } from './modules/tasks.js';
import { WeatherService } from './modules/weather.js';
import { Calculator } from './modules/calculator.js';
import { NotificationManager } from './modules/notifications.js';
import { SystemMonitor } from './modules/monitor.js';
import { DataVisualizer } from './modules/visualizer.js';
import { InternetSearch } from './modules/search.js';
import { CodeExecutor } from './modules/code.js';
import { TranslationService } from './modules/translate.js';
import { EncryptionModule } from './modules/crypto.js';
import { BackupManager } from './modules/backup.js';

class JarvisApp {
    constructor() {
        this.version = '2.0.0';
        this.initialized = false;
        this.currentTheme = 'jarvis';
        this.userPreferences = {};
        
        // Core Systems
        this.brain = null;
        this.memory = null;
        this.intent = null;
        this.response = null;
        this.learning = null;
        this.emotion = null;
        
        // Interface Systems
        this.voice = null;
        this.wakeWord = null;
        this.vision = null;
        
        // Module Systems
        this.modules = {};
        
        // UI State
        this.ui = {
            bootScreen: document.getElementById('boot-sequence'),
            appContainer: document.getElementById('app-container'),
            chatMessages: document.getElementById('chat-messages'),
            mainInput: document.getElementById('main-input'),
            statusIndicators: {},
            panels: {}
        };
        
        // Conversation Context
        this.conversationContext = {
            history: [],
            currentTopic: null,
            userMood: 'neutral',
            lastInteraction: null,
            sessionStart: Date.now()
        };

        this.init();
    }

    async init() {
        console.log(`🚀 J.A.R.V.I.S. v${this.version} Initializing...`);
        await this.performBootSequence();
        await this.initializeCoreSystems();
        await this.initializeModules();
        this.setupEventListeners();
        this.startSystemLoops();
        this.completeInitialization();
    }

    async performBootSequence() {
        const steps = [
            { msg: 'Loading kernel modules...', progress: 10, delay: 200 },
            { msg: 'Initializing memory banks...', progress: 25, delay: 300 },
            { msg: 'Mounting emotional core...', progress: 40, delay: 250 },
            { msg: 'Calibrating voice synthesis...', progress: 55, delay: 400 },
            { msg: 'Establishing secure connection...', progress: 70, delay: 300 },
            { msg: 'Loading user preferences...', progress: 85, delay: 200 },
            { msg: 'System ready. Awaiting command.', progress: 100, delay: 500 }
        ];

        const bootLog = document.getElementById('boot-log');
        const bootBar = document.getElementById('boot-bar');
        const bootStatus = document.getElementById('boot-status');

        for (const step of steps) {
            bootStatus.textContent = step.msg;
            bootBar.style.width = `${step.progress}%`;
            
            const logEntry = document.createElement('div');
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${step.msg}`;
            bootLog.appendChild(logEntry);
            bootLog.scrollTop = bootLog.scrollHeight;
            
            await this.sleep(step.delay);
        }

        await this.sleep(500);
    }

    async initializeCoreSystems() {
        // Initialize Memory First (Required by other systems)
        this.memory = new MemoryManager({
            maxFacts: 10000,
            maxHistory: 1000,
            compressionEnabled: true
        });
        await this.memory.initialize();

        // Initialize Emotional Core
        this.emotion = new EmotionalCore({
            baseline: 'neutral',
            volatility: 0.3,
            empathyLevel: 0.8
        });

        // Initialize Intent Processor
        this.intent = new IntentProcessor({
            fuzzyMatching: true,
            confidenceThreshold: 0.7,
            useContext: true
        });

        // Initialize Learning Engine
        this.learning = new LearningEngine({
            autoLearn: true,
            confirmationRequired: false,
            maxConfidence: 1.0
        });

        // Initialize Response Generator
        this.response = new ResponseGenerator({
            personality: 'professional',
            useEmojis: true,
            maxLength: 500,
            creativity: 0.7
        });

        // Initialize Brain (Central Orchestrator)
        this.brain = new JarvisBrain({
            memory: this.memory,
            emotion: this.emotion,
            intent: this.intent,
            response: this.response,
            learning: this.learning
        });

        // Initialize Voice Systems
        this.voice = new VoiceController({
            language: 'en-US',
            pitch: 0.9,
            rate: 1.1,
            volume: 1.0
        });

        this.wakeWord = new WakeWordDetector({
            keywords: ['hey jarvis', 'jarvis', 'okay jarvis'],
            sensitivity: 0.8
        });

        // Initialize Vision System
        this.vision = new VisionSystem({
            detectionInterval: 100,
            recognitionThreshold: 0.6
        });
    }

    async initializeModules() {
        this.modules.taskManager = new TaskManager(this.memory);
        this.modules.weather = new WeatherService();
        this.modules.calculator = new Calculator();
        this.modules.notifications = new NotificationManager();
        this.modules.monitor = new SystemMonitor();
        this.modules.visualizer = new DataVisualizer('audio-visualizer');
        this.modules.search = new InternetSearch();
        this.modules.code = new CodeExecutor();
        this.modules.translate = new TranslationService();
        this.modules.crypto = new EncryptionModule();
        this.modules.backup = new BackupManager(this.memory);

        // Initialize all modules
        await Promise.all(Object.values(this.modules).map(m => 
            m.initialize ? m.initialize() : Promise.resolve()
        ));
    }

    setupEventListeners() {
        // Boot Transition
        setTimeout(() => {
            this.ui.bootScreen.style.opacity = '0';
            setTimeout(() => {
                this.ui.bootScreen.classList.add('hidden');
                this.ui.appContainer.classList.remove('hidden');
                this.speak("All systems operational. Welcome back, sir.");
            }, 500);
        }, 500);

        // Input Handling
        this.ui.mainInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
            this.autoResizeTextarea();
        });

        document.getElementById('main-send-btn').addEventListener('click', () => {
            this.handleUserInput();
        });

        // Voice Control
        document.getElementById('main-mic-btn').addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        // Panel Toggles
        document.querySelectorAll('.panel-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.closest('.panel').querySelector('.panel-content');
                panel.classList.toggle('collapsed');
                e.target.textContent = panel.classList.contains('collapsed') ? '+' : '−';
            });
        });

        // Settings Modal
        document.getElementById('btn-settings').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.remove('hidden');
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal-overlay').classList.add('hidden');
            });
        });

        // Settings Tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetPanel = e.target.dataset.tab;
                
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
                
                e.target.classList.add('active');
                document.querySelector(`.settings-panel[data-panel="${targetPanel}"]`).classList.add('active');
            });
        });

        // Theme Switching
        document.getElementById('setting-theme').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // Quick Actions
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.executeQuickAction(action);
            });
        });

        // Vision Modal
        document.getElementById('btn-vision').addEventListener('click', () => {
            document.getElementById('vision-modal').classList.remove('hidden');
            this.vision.start();
        });

        // Calculator
        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = e.target.dataset.val;
                this.modules.calculator.input(val);
                document.getElementById('calc-display').textContent = this.modules.calculator.getDisplay();
            });
        });

        // Context Menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.message-bubble')) {
                e.preventDefault();
                this.showContextMenu(e, e.target.closest('.message'));
            }
        });

        document.addEventListener('click', () => {
            document.getElementById('context-menu').classList.add('hidden');
        });

        // Window Events
        window.addEventListener('beforeunload', () => {
            this.memory.saveSession(this.conversationContext);
        });

        window.addEventListener('resize', () => {
            this.modules.visualizer.resize();
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.ui.mainInput.focus();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.toggleVoiceInput();
                        break;
                    case ',':
                        e.preventDefault();
                        document.getElementById('settings-modal').classList.remove('hidden');
                        break;
                }
            }
        });
    }

    startSystemLoops() {
        // Clock Update
        setInterval(() => this.updateClock(), 1000);
        
        // Resource Monitor
        setInterval(() => this.updateResourceMonitor(), 2000);
        
        // Emotion Decay
        setInterval(() => this.emotion.decay(), 5000);
        
        // Auto-save
        setInterval(() => this.memory.save(), 30000);
        
        // Connection Status
        setInterval(() => this.checkConnection(), 10000);
    }

    completeInitialization() {
        this.initialized = true;
        this.loadUserPreferences();
        this.updateMemoryDisplay();
        this.modules.notifications.show({
            title: 'System Online',
            message: 'J.A.R.V.I.S. is ready to assist you.',
            type: 'success',
            duration: 3000
        });
    }

    // Core Interaction Methods

    async handleUserInput(text = null) {
        const input = text || this.ui.mainInput.value.trim();
        if (!input) return;

        // Clear input
        if (!text) this.ui.mainInput.value = '';
        this.autoResizeTextarea();

        // Add user message to UI
        this.addMessage('user', input);
        
        // Add to conversation history
        this.conversationContext.history.push({ role: 'user', content: input, timestamp: Date.now() });
        
        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Process through brain
            const response = await this.brain.process(input, {
                context: this.conversationContext,
                emotion: this.emotion.getState(),
                memory: this.memory
            });

            // Hide typing indicator
            this.hideTypingIndicator();

            // Add response to UI
            this.addMessage('jarvis', response.text, response.metadata);
            
            // Speak if voice enabled
            if (this.userPreferences.voiceEnabled) {
                this.speak(response.text);
            }

            // Update context
            this.conversationContext.history.push({ role: 'assistant', content: response.text, timestamp: Date.now() });
            this.conversationContext.lastInteraction = Date.now();
            
            // Update displays
            this.updateEmotionDisplay();
            this.updateMemoryDisplay();

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('jarvis', 'I apologize, but I encountered an error processing your request.');
            console.error('Processing error:', error);
        }
    }

    addMessage(sender, text, metadata = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // Process markdown for Jarvis messages
        if (sender === 'jarvis' && text.includes('```')) {
            bubble.innerHTML = this.formatCodeBlocks(text);
        } else {
            bubble.textContent = text;
        }
        
        const meta = document.createElement('div');
        meta.className = 'message-meta';
        
        const time = document.createElement('span');
        time.textContent = new Date().toLocaleTimeString();
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';
        
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        actions.innerHTML = `
            <button class="message-action-btn" onclick="jarvis.copyMessage(this)">📋</button>
            <button class="message-action-btn" onclick="jarvis.speakMessage(this)">🔊</button>
            <button class="message-action-btn" onclick="jarvis.saveMessage(this)">💾</button>
        `;
        
        meta.appendChild(sender === 'jarvis' ? avatar : time);
        meta.appendChild(sender === 'jarvis' ? time : avatar);
        meta.appendChild(actions);
        
        messageDiv.appendChild(bubble);
        messageDiv.appendChild(meta);
        
        this.ui.chatMessages.appendChild(messageDiv);
        this.ui.chatMessages.scrollTop = this.ui.chatMessages.scrollHeight;
    }

    formatCodeBlocks(text) {
        return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `
                <div class="code-block">
                    <div class="code-header">
                        <span class="code-lang">${lang || 'code'}</span>
                        <button class="code-copy" onclick="jarvis.copyCode(this)">Copy</button>
                    </div>
                    <pre><code>${this.escapeHtml(code.trim())}</code></pre>
                </div>
            `;
        }).replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message message-jarvis typing-message';
        indicator.innerHTML = `
            <div class="message-bubble" style="padding: 20px;">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        indicator.id = 'typing-indicator';
        this.ui.chatMessages.appendChild(indicator);
        this.ui.chatMessages.scrollTop = this.ui.chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    // Voice Methods

    toggleVoiceInput() {
        const micBtn = document.getElementById('main-mic-btn');
        
        if (this.voice.isListening) {
            this.voice.stop();
            micBtn.classList.remove('recording');
            this.modules.visualizer.stop();
        } else {
            micBtn.classList.add('recording');
            this.modules.visualizer.start();
            
            this.voice.start((transcript) => {
                this.handleUserInput(transcript);
                micBtn.classList.remove('recording');
                this.modules.visualizer.stop();
            });
        }
    }

    speak(text) {
        // Remove markdown for speech
        const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block.').replace(/[#*_`]/g, '');
        this.voice.speak(cleanText);
    }

    // UI Update Methods

    updateClock() {
        const now = new Date();
        const timeStr = this.userPreferences.timeFormat === '24' 
            ? now.toLocaleTimeString('en-GB')
            : now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
        
        document.getElementById('system-clock').textContent = timeStr;
        document.getElementById('system-date').textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    updateResourceMonitor() {
        // Simulate resource monitoring
        const cpu = Math.floor(Math.random() * 30) + 10;
        const mem = Math.floor(Math.random() * 200) + 100;
        
        document.getElementById('cpu-bar').style.width = `${cpu}%`;
        document.getElementById('cpu-text').textContent = `${cpu}%`;
        
        document.getElementById('mem-bar').style.width = `${(mem/512)*100}%`;
        document.getElementById('mem-text').textContent = `${mem}MB`;
    }

    updateEmotionDisplay() {
        const state = this.emotion.getState();
        document.getElementById('current-emotion').textContent = state.emoji;
        
        // Update metrics bars
        const metricsContainer = document.getElementById('emotion-metrics');
        metricsContainer.innerHTML = Object.entries(state.dimensions)
            .map(([dim, val]) => `
                <div class="emotion-bar">
                    <span>${dim}</span>
                    <div class="bar-bg"><div class="bar-fill" style="width: ${val}%"></div></div>
                </div>
            `).join('');
    }

    updateMemoryDisplay() {
        const stats = this.memory.getStats();
        document.getElementById('mem-facts').textContent = stats.facts;
        document.getElementById('mem-prefs').textContent = stats.preferences;
        document.getElementById('mem-chats').textContent = stats.conversations;
    }

    checkConnection() {
        const isOnline = navigator.onLine;
        const connStatus = document.getElementById('connection-status');
        const connText = connStatus.querySelector('.conn-text');
        const connDot = connStatus.querySelector('.conn-dot');
        
        if (isOnline) {
            connText.textContent = 'ONLINE';
            connStatus.style.borderColor = 'var(--success)';
            connStatus.style.color = 'var(--success)';
            connDot.style.background = 'var(--success)';
        } else {
            connText.textContent = 'OFFLINE';
            connStatus.style.borderColor = 'var(--warning)';
            connStatus.style.color = 'var(--warning)';
            connDot.style.background = 'var(--warning)';
        }
    }

    // Action Methods

    executeQuickAction(action) {
        switch(action) {
            case 'weather':
                this.handleUserInput("What's the weather like?");
                break;
            case 'news':
                this.handleUserInput("Show me today's headlines");
                break;
            case 'reminder':
                this.ui.mainInput.value = "Remind me to ";
                this.ui.mainInput.focus();
                break;
            case 'calculate':
                document.querySelector('.calc-panel').scrollIntoView({ behavior: 'smooth' });
                break;
        }
    }

    setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        this.currentTheme = themeName;
        this.memory.setPreference('theme', themeName);
    }

    showContextMenu(e, messageElement) {
        const menu = document.getElementById('context-menu');
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;
        menu.classList.remove('hidden');
        
        // Store reference to message
        menu.dataset.targetMessage = messageElement.dataset.id;
    }

    // Utility Methods

    autoResizeTextarea() {
        const textarea = this.ui.mainInput;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    loadUserPreferences() {
        const prefs = this.memory.getPreferences();
        this.userPreferences = {
            voiceEnabled: prefs.voiceEnabled ?? true,
            theme: prefs.theme || 'jarvis',
            timeFormat: prefs.timeFormat || '24',
            language: prefs.language || 'en-US',
            ...prefs
        };
        
        this.setTheme(this.userPreferences.theme);
        document.getElementById('setting-username').value = prefs.userName || '';
    }

    // Public API Methods (exposed to window)

    copyMessage(btn) {
        const text = btn.closest('.message').querySelector('.message-bubble').textContent;
        navigator.clipboard.writeText(text);
        this.modules.notifications.show({ title: 'Copied', message: 'Message copied to clipboard', type: 'success' });
    }

    speakMessage(btn) {
        const text = btn.closest('.message').querySelector('.message-bubble').textContent;
        this.speak(text);
    }

    saveMessage(btn) {
        const text = btn.closest('.message').querySelector('.message-bubble').textContent;
        this.memory.saveFact('savedMessage', text);
        this.modules.notifications.show({ title: 'Saved', message: 'Message saved to memory', type: 'success' });
    }

    copyCode(btn) {
        const code = btn.closest('.code-block').querySelector('code').textContent;
        navigator.clipboard.writeText(code);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
    }
}

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
    window.jarvis = new JarvisApp();
});
