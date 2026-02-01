// ============================================
// VOICE SYSTEM: SPEECH CONTROLLER
// Advanced Voice Synthesis & Recognition
// ============================================

export class VoiceController {
    constructor(config) {
        this.config = config;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.voiceQueue = [];
        this.currentUtterance = null;
        this.audioContext = null;
        this.analyser = null;
        this.init();
    }

    init() {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.config.language;
            
            this.setupRecognitionHandlers();
        }

        // Initialize Audio Context for visualization
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
        } catch (e) {
            console.warn('Audio context not supported');
        }
    }

    setupRecognitionHandlers() {
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Voice recognition started');
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                this.onResultCallback?.(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
            // Auto-restart if continuous mode
            if (this.continuousMode) {
                this.start();
            }
        };
    }

    start(onResult, options = {}) {
        if (!this.recognition) {
            console.error('Speech recognition not supported');
            return;
        }

        this.onResultCallback = onResult;
        this.continuousMode = options.continuous || false;
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error('Failed to start recognition:', e);
        }
    }

    stop() {
        if (this.recognition) {
            this.recognition.stop();
            this.continuousMode = false;
        }
        this.isListening = false;
    }

    speak(text, options = {}) {
        if (!this.synthesis) return;

        // Cancel current speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = options.pitch || this.config.pitch;
        utterance.rate = options.rate || this.config.rate;
        utterance.volume = options.volume || this.config.volume;
        utterance.lang = options.lang || this.config.language;

        // Select voice
        const voices = this.synthesis.getVoices();
        const preferredVoice = this.selectVoice(voices, options.gender || 'male');
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.startVisualization();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.stopVisualization();
            
            // Process queue
            if (this.voiceQueue.length > 0) {
                const next = this.voiceQueue.shift();
                this.speak(next.text, next.options);
            }
        };

        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            this.isSpeaking = false;
        };

        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
    }

    queueSpeech(text, options = {}) {
        if (this.isSpeaking) {
            this.voiceQueue.push({ text, options });
        } else {
            this.speak(text, options);
        }
    }

    selectVoice(voices, gender) {
        // Prefer Google voices or system voices with gender indicators
        const preferred = voices.filter(v => {
            const name = v.name.toLowerCase();
            if (gender === 'male') {
                return name.includes('male') || name.includes('david') || name.includes('james');
            } else {
                return name.includes('female') || name.includes('zira') || name.includes('heera');
            }
        });

        // Fallback to Google US English
        const googleVoice = voices.find(v => v.name.includes('Google US English'));
        
        return preferred[0] || googleVoice || voices[0];
    }

    startVisualization() {
        // Connect to visualizer if available
        if (this.audioContext && window.jarvis?.modules?.visualizer) {
            // Visualization handled by visualizer module
        }
    }

    stopVisualization() {
        // Stop visualizer
    }

    pause() {
        this.synthesis.pause();
    }

    resume() {
        this.synthesis.resume();
    }

    cancel() {
        this.synthesis.cancel();
        this.voiceQueue = [];
        this.isSpeaking = false;
    }

    // Utility methods for voice effects
    applyEffect(effect) {
        // Placeholder for future voice effects
        switch(effect) {
            case 'echo':
                // Would implement Web Audio API effects
                break;
            case 'robot':
                break;
        }
    }
}