// ============================================
// CORE SYSTEM: BRAIN
// Central Processing Unit
// ============================================

import { EventEmitter } from '../utils/events.js';

export class JarvisBrain extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.processingQueue = [];
        this.isProcessing = false;
        this.contextWindow = [];
        this.maxContextLength = 20;
    }

    async process(input, context) {
        this.isProcessing = true;
        this.emit('status', 'PROCESSING');

        try {
            // 1. Preprocessing
            const normalizedInput = this.normalizeInput(input);
            
            // 2. Context Analysis
            this.updateContext(normalizedInput);
            
            // 3. Intent Recognition
            const intent = await this.config.intent.recognize(normalizedInput, {
                context: this.contextWindow,
                emotion: context.emotion
            });

            // 4. Memory Retrieval
            const relevantMemories = await this.retrieveRelevantMemories(intent, normalizedInput);

            // 5. Emotional Analysis
            const emotionalContext = this.config.emotion.analyze(normalizedInput);

            // 6. Knowledge Processing
            let knowledge = null;
            if (intent.requiresKnowledge) {
                knowledge = await this.acquireKnowledge(intent);
            }

            // 7. Response Generation
            const response = await this.config.response.generate({
                intent,
                input: normalizedInput,
                context: this.contextWindow,
                memories: relevantMemories,
                emotion: emotionalContext,
                knowledge,
                personality: this.config.personality
            });

            // 8. Learning Update
            if (this.config.learning.config.autoLearn) {
                this.config.learning.learnFromInteraction({
                    input: normalizedInput,
                    intent,
                    response: response.text,
                    context: emotionalContext
                });
            }

            // 9. Post-processing
            this.finalizeProcessing(response);

            return response;

        } catch (error) {
            this.emit('error', error);
            return {
                text: "I apologize, but I'm having trouble processing that request.",
                metadata: { error: true }
            };
        } finally {
            this.isProcessing = false;
            this.emit('status', 'IDLE');
        }
    }

    normalizeInput(input) {
        return input
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s.,!?-]/g, '');
    }

    updateContext(input) {
        this.contextWindow.push(input);
        if (this.contextWindow.length > this.maxContextLength) {
            this.contextWindow.shift();
        }
    }

    async retrieveRelevantMemories(intent, input) {
        const memories = [];
        
        // Search for topic-related memories
        if (intent.entities.topic) {
            const topicMemories = await this.config.memory.search(intent.entities.topic);
            memories.push(...topicMemories);
        }

        // Search for user preferences
        const prefs = await this.config.memory.getPreferences();
        
        // Get recent conversation context
        const recentContext = this.contextWindow.slice(-5);
        
        return { facts: memories, preferences: prefs, recent: recentContext };
    }

    async acquireKnowledge(intent) {
        // Search internet if needed
        if (intent.requiresInternet) {
            // Implementation would call search module
        }
        
        // Query internal knowledge base
        return this.config.memory.queryKnowledgeBase(intent.entities);
    }

    finalizeProcessing(response) {
        this.emit('processingComplete', response);
        
        // Update emotional state based on interaction
        this.config.emotion.updateFromInteraction(response);
    }
}