// ============================================
// CORE SYSTEM: LEARNING ENGINE
// Adaptive Learning & Knowledge Acquisition
// ============================================

export class LearningEngine {
    constructor(config) {
        this.config = config;
        this.knowledgeBase = new Map();
        this.correctionQueue = [];
        this.learningPatterns = this.initializePatterns();
    }

    initializePatterns() {
        return {
            factPattern: /\b(\w+(?:\s+\w+){0,5})\s+(?:is|are|was|were|means|refers\s+to)\s+(.+?)(?:\.|$)/i,
            preferencePattern: /\b(i\s+(?:like|love|prefer|hate|dislike)|my\s+favorite)\s+(.+?)(?:\.|$)/i,
            definitionPattern: /\b(\w+)\s+(?:is\s+defined\s+as|means|refers\s+to)\s+(.+?)(?:\.|$)/i,
            relationshipPattern: /\b(\w+)\s+(?:is\s+a|is\s+an|is\s+the)\s+(\w+(?:\s+\w+)?)\s+of\s+(\w+)/i
        };
    }

    learnFromInteraction(interaction) {
        const { input, intent, response, context } = interaction;

        // Extract potential facts
        const facts = this.extractFacts(input);
        
        facts.forEach(fact => {
            this.storeFact(fact, {
                source: 'conversation',
                confidence: this.calculateInitialConfidence(intent, context),
                context: interaction
            });
        });

        // Learn from corrections
        if (intent.isCorrection) {
            this.processCorrection(interaction);
        }

        // Update user model
        this.updateUserModel(interaction);
    }

    extractFacts(text) {
        const facts = [];

        // Try each pattern
        for (const [type, pattern] of Object.entries(this.learningPatterns)) {
            const match = text.match(pattern);
            if (match) {
                facts.push({
                    type,
                    subject: match[1].trim(),
                    predicate: match[2]?.trim(),
                    object: match[3]?.trim(),
                    fullText: match[0]
                });
            }
        }

        return facts;
    }

    storeFact(fact, metadata) {
        const key = `${fact.type}:${fact.subject}`;
        
        const existing = this.knowledgeBase.get(key);
        if (existing) {
            // Update with confidence blending
            existing.confidence = this.blendConfidence(
                existing.confidence,
                metadata.confidence
            );
            existing.occurrences++;
            existing.lastUpdated = Date.now();
        } else {
            this.knowledgeBase.set(key, {
                ...fact,
                ...metadata,
                created: Date.now(),
                occurrences: 1,
                verified: false
            });
        }
    }

    calculateInitialConfidence(intent, context) {
        let confidence = 0.5;

        // Boost for explicit learning intents
        if (intent.intent === 'MEMORY_STORE') confidence += 0.3;

        // Boost for high emotional trust
        if (context.emotion?.dimensions?.trust > 0.7) confidence += 0.1;

        // Reduce for ambiguous contexts
        if (intent.confidence < 0.8) confidence -= 0.2;

        return Math.max(0, Math.min(1, confidence));
    }

    blendConfidence(oldConf, newConf) {
        // Weighted average favoring established knowledge
        return (oldConf * 0.7) + (newConf * 0.3);
    }

    processCorrection(interaction) {
        const { input, context } = interaction;
        
        // Find what was wrong
        const recentFacts = this.getRecentFacts(5);
        
        // Try to identify the corrected fact
        const correction = {
            timestamp: Date.now(),
            originalContext: context,
            userInput: input
        };

        this.correctionQueue.push(correction);
        
        // Reduce confidence in recent related facts
        recentFacts.forEach(fact => {
            fact.confidence *= 0.5; // Penalty
        });

        // If we have explicit "X is actually Y" pattern
        const correctionMatch = input.match(/actually|meant|correctly|is\s+(.+)/i);
        if (correctionMatch) {
            this.learnFromExplicitCorrection(correctionMatch[1], recentFacts[0]);
        }
    }

    learnFromExplicitCorrection(correctValue, originalFact) {
        if (originalFact) {
            // Create corrected fact
            this.storeFact({
                type: originalFact.type,
                subject: originalFact.subject,
                predicate: correctValue
            }, {
                confidence: 0.9, // High confidence for explicit correction
                source: 'explicit_correction'
            });
        }
    }

    updateUserModel(interaction) {
        // Track user preferences and patterns
        const userModel = this.getUserModel();
        
        // Update interaction frequency
        const hour = new Date().getHours();
        userModel.activeHours[hour] = (userModel.activeHours[hour] || 0) + 1;
        
        // Track topic interests
        if (interaction.intent.entities?.topic) {
            const topic = interaction.intent.entities.topic;
            userModel.interests[topic] = (userModel.interests[topic] || 0) + 1;
        }

        this.saveUserModel(userModel);
    }

    getUserModel() {
        const stored = localStorage.getItem('jarvis_user_model');
        return stored ? JSON.parse(stored) : {
            activeHours: {},
            interests: {},
            communicationStyle: 'neutral',
            expertiseAreas: []
        };
    }

    saveUserModel(model) {
        localStorage.setItem('jarvis_user_model', JSON.stringify(model));
    }

    getRecentFacts(count) {
        return Array.from(this.knowledgeBase.values())
            .sort((a, b) => b.lastUpdated - a.lastUpdated)
            .slice(0, count);
    }

    checkForLearningOpportunity(input, response) {
        // Check if we should ask for clarification
        if (response.confidence < 0.5) {
            return {
                shouldAsk: true,
                question: "I'm not entirely sure I understood. Could you clarify what you meant?"
            };
        }
        return { shouldAsk: false };
    }

    getKnowledgeStats() {
        return {
            totalFacts: this.knowledgeBase.size,
            verifiedFacts: Array.from(this.knowledgeBase.values()).filter(f => f.verified).length,
            pendingCorrections: this.correctionQueue.length,
            averageConfidence: this.calculateAverageConfidence()
        };
    }

    calculateAverageConfidence() {
        const facts = Array.from(this.knowledgeBase.values());
        if (facts.length === 0) return 0;
        return facts.reduce((sum, f) => sum + f.confidence, 0) / facts.length;
    }
}