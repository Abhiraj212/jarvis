// ============================================
// CORE SYSTEM: RESPONSE GENERATOR
// Dynamic Response Generation Engine
// ============================================

export class ResponseGenerator {
    constructor(config) {
        this.config = config;
        this.responseTemplates = this.initializeTemplates();
        this.variationHistory = new Map();
        this.maxHistorySize = 5;
    }

    initializeTemplates() {
        return {
            GREETING: {
                formal: [
                    "Good {time}, {name}. How may I assist you today?",
                    "Hello, {name}. Systems are operational and ready.",
                    "Greetings. I hope you're having a productive {time}."
                ],
                casual: [
                    "Hey {name}! What's up?",
                    "Hi there! Ready to help.",
                    "Hello! Great to see you again."
                ],
                enthusiastic: [
                    "Hello {name}! Ready for action! 🚀",
                    "Hey there! Full power and ready to assist! ⚡",
                    "Greetings! Let's make things happen! 💪"
                ]
            },
            FAREWELL: {
                formal: [
                    "Goodbye, {name}. Have a productive day.",
                    "Until next time. Take care.",
                    "Farewell. I'll be here when you need me."
                ],
                casual: [
                    "See you later!",
                    "Bye! Catch you soon.",
                    "Take it easy!"
                ]
            },
            UNKNOWN: {
                clarifying: [
                    "I'm not sure I understand. Could you rephrase that?",
                    "Could you provide more context about what you're looking for?",
                    "I want to make sure I help correctly. Can you elaborate?"
                ],
                learning: [
                    "I don't have information on that yet, but I'm learning.",
                    "That's new to me. Would you like to teach me about it?",
                    "I'm still expanding my knowledge base on that topic."
                ]
            },
            CONFIRMATION: {
                success: [
                    "Understood. I'll remember that.",
                    "Noted and stored in my memory banks.",
                    "Confirmed. I've updated my records."
                ]
            },
            ERROR: {
                apology: [
                    "I apologize, but I encountered an error processing that request.",
                    "Something went wrong on my end. Let me try again.",
                    "I seem to be having trouble with that. Could you try again?"
                ]
            }
        };
    }

    async generate(params) {
        const { intent, input, context, memories, emotion, knowledge, personality } = params;
        
        // Select response strategy
        let response = '';
        let metadata = {};

        switch(intent.intent) {
            case 'GREETING':
                response = this.generateGreeting(context, emotion);
                break;
            case 'FAREWELL':
                response = this.generateFarewell(context);
                break;
            case 'QUESTION':
                response = await this.generateAnswer(intent, knowledge, memories);
                break;
            case 'MEMORY_STORE':
                response = this.generateConfirmation('success');
                metadata.stored = true;
                break;
            case 'MEMORY_RECALL':
                response = this.generateRecall(intent, memories);
                break;
            case 'COMMAND':
                response = this.generateCommandResponse(intent);
                break;
            case 'EMOTIONAL':
                response = this.generateEmpathyResponse(input, emotion);
                break;
            case 'UNKNOWN':
                response = this.selectVariation('UNKNOWN', emotion.arousal > 0.6 ? 'clarifying' : 'learning');
                break;
            default:
                response = this.generateConversationalResponse(intent, context, emotion);
        }

        // Apply personality modifiers
        response = this.applyPersonality(response, personality);
        
        // Add emotion indicators if appropriate
        if (this.config.useEmojis && emotion.intensity > 0.7) {
            response = this.addEmotionalIndicator(response, emotion);
        }

        // Check for repetition
        response = this.avoidRepetition(response, intent.intent);

        // Trim to max length
        if (response.length > this.config.maxLength) {
            response = response.substring(0, this.config.maxLength) + '...';
        }

        return { text: response, metadata };
    }

    generateGreeting(context, emotion) {
        const timeOfDay = this.getTimeOfDay();
        const tone = this.selectTone(emotion);
        const template = this.selectVariation('GREETING', tone);
        
        return this.fillTemplate(template, {
            time: timeOfDay,
            name: context.preferences?.userName || 'Sir'
        });
    }

    generateFarewell(context) {
        const tone = this.selectTone({ current: 'neutral' });
        const template = this.selectVariation('FAREWELL', tone);
        
        return this.fillTemplate(template, {
            name: context.preferences?.userName || 'Sir'
        });
    }

    async generateAnswer(intent, knowledge, memories) {
        // Check if we have specific knowledge
        if (knowledge) {
            return this.formatKnowledgeResponse(knowledge);
        }

        // Check memories
        if (memories.facts && memories.facts.length > 0) {
            const fact = memories.facts[0];
            return `According to my records, ${fact.value}. (Confidence: ${Math.round(fact.confidence * 100)}%)`;
        }

        // Fallback
        return this.selectVariation('UNKNOWN', 'clarifying');
    }

    generateRecall(intent, memories) {
        const topic = intent.entities.topic;
        
        if (memories.facts.length > 0) {
            const fact = memories.facts[0];
            return `I recall that ${topic} is ${fact.value}.`;
        }
        
        return `I don't have any information stored about ${topic}. Would you like to tell me?`;
    }

    generateCommandResponse(intent) {
        return `Executing command regarding ${intent.entities.topic || 'your request'}.`;
    }

    generateEmpathyResponse(input, emotion) {
        const responses = {
            joy: [
                "That's wonderful to hear! 😊",
                "I'm glad things are going well!",
                "Your positive energy is contagious!"
            ],
            sadness: [
                "I'm sorry to hear that. I'm here if you need to talk.",
                "That sounds difficult. Is there anything I can do to help?",
                "I understand. Take all the time you need."
            ],
            anger: [
                "I can sense your frustration. Let's work through this together.",
                "Take a deep breath. I'm here to help resolve this.",
                "I understand you're upset. What can I do to assist?"
            ],
            fear: [
                "It's okay to feel that way. We'll figure this out.",
                "I'm here with you. Let's approach this step by step.",
                "Your safety and comfort are important. How can I help?"
            ]
        };

        const category = responses[emotion.current] || responses.joy;
        return category[Math.floor(Math.random() * category.length)];
    }

    generateConversationalResponse(intent, context, emotion) {
        // Context-aware conversational filler
        if (context.recent.length > 0) {
            return "I see. Please tell me more about that.";
        }
        
        return "Interesting. How can I help you with this?";
    }

    selectTone(emotion) {
        if (emotion.intensity > 0.8) return 'enthusiastic';
        if (emotion.intensity < 0.3) return 'formal';
        return 'casual';
    }

    selectVariation(intentType, category) {
        const pool = this.responseTemplates[intentType]?.[category] || 
                     this.responseTemplates[intentType] ||
                     ["I'm not sure how to respond to that."];
        
        // Get recent variations for this intent
        const history = this.variationHistory.get(intentType) || [];
        
        // Filter out recent ones
        const available = pool.filter(r => !history.includes(r));
        const selectionPool = available.length > 0 ? available : pool;
        
        const selected = selectionPool[Math.floor(Math.random() * selectionPool.length)];
        
        // Update history
        history.push(selected);
        if (history.length > this.maxHistorySize) history.shift();
        this.variationHistory.set(intentType, history);
        
        return selected;
    }

    fillTemplate(template, variables) {
        return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match);
    }

    applyPersonality(text, personality) {
        switch(personality) {
            case 'professional':
                return text.replace(/!/g, '.').replace(/🚀|⚡|💪/g, '');
            case 'friendly':
                return text.replace(/\bsir\b/gi, 'friend');
            case 'witty':
                return text + " (Not that you needed me to tell you that.)";
            default:
                return text;
        }
    }

    addEmotionalIndicator(text, emotion) {
        const indicators = {
            joy: ' 😊',
            excitement: ' 🎉',
            surprise: ' 😮',
            concern: ' 🤔'
        };
        
        const indicator = indicators[emotion.current];
        return indicator ? text + indicator : text;
    }

    avoidRepetition(text, intentType) {
        // Simple repetition check
        const recent = this.variationHistory.get('global') || [];
        if (recent.includes(text)) {
            return this.selectVariation(intentType, 'casual');
        }
        
        recent.push(text);
        if (recent.length > 10) recent.shift();
        this.variationHistory.set('global', recent);
        
        return text;
    }

    formatKnowledgeResponse(knowledge) {
        if (Array.isArray(knowledge)) {
            return knowledge.map(k => `• ${k}`).join('\n');
        }
        return String(knowledge);
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }
}