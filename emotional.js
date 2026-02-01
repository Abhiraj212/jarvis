// ============================================
// CORE SYSTEM: EMOTIONAL CORE
// Emotion Engine with Dimensional Model
// ============================================

export class EmotionalCore {
    constructor(config) {
        this.config = config;
        this.state = {
            current: config.baseline || 'neutral',
            intensity: 0.5,
            dimensions: {
                joy: 0.5,
                sadness: 0.5,
                anger: 0.5,
                fear: 0.5,
                surprise: 0.5,
                trust: 0.5
            },
            valence: 0, // Positive/Negative
            arousal: 0.5 // Active/Passive
        };
        this.history = [];
        this.maxHistory = 100;
    }

    analyze(text) {
        const emotions = this.detectEmotions(text);
        this.updateDimensions(emotions);
        this.calculateValenceArousal();
        
        const dominant = this.getDominantEmotion();
        this.state.current = dominant.emotion;
        this.state.intensity = dominant.intensity;
        
        this.recordState();
        
        return { ...this.state };
    }

    detectEmotions(text) {
        const emotionKeywords = {
            joy: ['happy', 'great', 'awesome', 'love', 'perfect', 'excellent', 'good', 'joy', 'wonderful', 'fantastic'],
            sadness: ['sad', 'sorry', 'unfortunate', 'bad', 'terrible', 'awful', 'miss', 'loss', 'cry'],
            anger: ['angry', 'mad', 'furious', 'hate', 'annoying', 'stupid', 'wrong', 'frustrated'],
            fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified', 'panic'],
            surprise: ['wow', 'amazing', 'unexpected', 'surprised', 'shocked', 'incredible', 'unbelievable'],
            trust: ['trust', 'believe', 'confident', 'sure', 'certain', 'reliable', 'honest']
        };

        const detected = {};
        const words = text.toLowerCase().split(/\s+/);
        
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            const count = words.filter(w => keywords.some(k => w.includes(k))).length;
            detected[emotion] = Math.min(count / 3, 1); // Normalize
        }

        // Check for negations
        if (text.match(/\b(not|no|never|don't|doesn't|didn't|isn't|aren't)\b/)) {
            // Invert emotions slightly
            for (const key in detected) {
                detected[key] *= 0.5;
            }
        }

        return detected;
    }

    updateDimensions(detected) {
        for (const [emotion, value] of Object.entries(detected)) {
            // Smooth transition
            const current = this.state.dimensions[emotion];
            this.state.dimensions[emotion] = current + (value - current) * this.config.volatility;
        }
    }

    calculateValenceArousal() {
        // Valence: Joy + Trust - Anger - Sadness
        this.state.valence = (
            this.state.dimensions.joy + 
            this.state.dimensions.trust - 
            this.state.dimensions.anger - 
            this.state.dimensions.sadness
        ) / 2;

        // Arousal: Anger + Fear + Surprise - Sadness
        this.state.arousal = (
            this.state.dimensions.anger + 
            this.state.dimensions.fear + 
            this.state.dimensions.surprise - 
            this.state.dimensions.sadness + 1
        ) / 2;
    }

    getDominantEmotion() {
        let maxEmotion = 'neutral';
        let maxValue = 0.3; // Threshold

        for (const [emotion, value] of Object.entries(this.state.dimensions)) {
            if (value > maxValue) {
                maxValue = value;
                maxEmotion = emotion;
            }
        }

        return { emotion: maxEmotion, intensity: maxValue };
    }

    updateFromInteraction(response) {
        // Adjust based on response success
        if (response.metadata.error) {
            this.state.dimensions.sadness += 0.1;
        } else if (response.metadata.helpful) {
            this.state.dimensions.joy += 0.1;
        }
        
        this.normalizeDimensions();
    }

    decay() {
        // Slowly return to baseline
        for (const key in this.state.dimensions) {
            const baseline = 0.5;
            const current = this.state.dimensions[key];
            this.state.dimensions[key] = current + (baseline - current) * 0.05;
        }
        this.calculateValenceArousal();
    }

    normalizeDimensions() {
        for (const key in this.state.dimensions) {
            this.state.dimensions[key] = Math.max(0, Math.min(1, this.state.dimensions[key]));
        }
    }

    recordState() {
        this.history.push({
            timestamp: Date.now(),
            state: { ...this.state }
        });
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    getState() {
        const emojiMap = {
            joy: '😄', sadness: '😢', anger: '😠', fear: '😨', 
            surprise: '😲', trust: '🤝', neutral: '😐'
        };
        
        return {
            ...this.state,
            emoji: emojiMap[this.state.current] || '😐'
        };
    }

    getEmoji() {
        return this.getState().emoji;
    }
}