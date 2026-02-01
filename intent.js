// ============================================
// CORE SYSTEM: INTENT PROCESSOR
// Advanced Intent Recognition with NLP
// ============================================

export class IntentProcessor {
    constructor(config) {
        this.config = config;
        this.intentPatterns = this.initializePatterns();
        this.entityExtractors = this.initializeEntityExtractors();
        this.confidenceThreshold = config.confidenceThreshold || 0.7;
    }

    initializePatterns() {
        return {
            GREETING: {
                patterns: [
                    /\b(hello|hi|hey|greetings|good\s+(morning|afternoon|evening)|what'?s\s+up|howdy)\b/i,
                    /^jarvis$/i
                ],
                confidence: 0.9,
                requiresContext: false
            },
            FAREWELL: {
                patterns: [
                    /\b(bye|goodbye|see\s+you|later|farewell|night|sleep)\b/i
                ],
                confidence: 0.9
            },
            QUESTION: {
                patterns: [
                    /\b(what|who|where|when|why|how|which|whose|whom)\b/i,
                    /\?$/,
                    /\b(can\s+you|could\s+you|would\s+you)\s+tell\s+me\b/i
                ],
                confidence: 0.8,
                subIntents: ['DEFINITION', 'FACT', 'OPINION', 'PROCEDURE']
            },
            COMMAND: {
                patterns: [
                    /\b(turn|switch|open|close|start|stop|set|change|make|create|delete|remove)\b/i,
                    /^(do|can\s+you|please)\s+/i
                ],
                confidence: 0.85,
                requiresAction: true
            },
            MEMORY_STORE: {
                patterns: [
                    /\b(remember|save|store|note|don't\s+forget|keep\s+in\s+mind)\b/i,
                    /\b(my\s+\w+\s+is|i\s+(like|love|hate|prefer))\b/i
                ],
                confidence: 0.9,
                entities: ['topic', 'value']
            },
            MEMORY_RECALL: {
                patterns: [
                    /\b(what\s+(is|was|did)|do\s+you\s+remember|tell\s+me\s+about|recall|retrieve)\b/i,
                    /\b(what\s+do\s+i|what\s+did\s+i|remind\s+me)\b/i
                ],
                confidence: 0.85,
                entities: ['topic']
            },
            SEARCH: {
                patterns: [
                    /\b(search|google|look\s+up|find|lookup|research)\b/i,
                    /\b(latest\s+news|what'?s\s+new|current\s+events)\b/i,
                    /\b(weather|forecast|temperature)\b/i
                ],
                confidence: 0.8,
                requiresInternet: true
            },
            CALCULATION: {
                patterns: [
                    /\b(calculate|compute|what\s+is|how\s+much|solve|math)\b/i,
                    /[\d+\-*/=]+/,
                    /\b(plus|minus|times|divided\s+by|square\s+root|power\s+of)\b/i
                ],
                confidence: 0.9
            },
            TRANSLATION: {
                patterns: [
                    /\b(translate|in\s+\w+|how\s+do\s+you\s+say|what\s+is\s+\w+\s+in)\b/i
                ],
                confidence: 0.9,
                entities: ['text', 'targetLang']
            },
            CODE: {
                patterns: [
                    /\b(code|program|script|function|write\s+(a|some)\s+(code|program)|debug|fix)\b/i,
                    /```/,
                    /\b(in\s+(python|javascript|java|cpp|c\+\+|html|css|sql))\b/i
                ],
                confidence: 0.85
            },
            EMOTIONAL: {
                patterns: [
                    /\b(feel|feeling|mood|happy|sad|angry|excited|bored|tired)\b/i,
                    /\b(i\s+am|i'm\s+feeling)\s+(good|bad|happy|sad)\b/i
                ],
                confidence: 0.8,
                requiresEmpathy: true
            },
            LEARNING: {
                patterns: [
                    /\b(learn|study|teach\s+me|explain|how\s+to|tutorial|guide)\b/i
                ],
                confidence: 0.8
            },
            TASK: {
                patterns: [
                    /\b(add|create)\s+(a\s+)?(task|todo|reminder)/i,
                    /\b(remind\s+me\s+to)\b/i,
                    /\b(what\s+are\s+my\s+tasks|show\s+my\s+list)\b/i
                ],
                confidence: 0.9
            },
            CORRECTION: {
                patterns: [
                    /\b(wrong|incorrect|that's\s+not|not\s+right|bad|terrible)\b/i,
                    /\b(i\s+said|meant|actually)\b/i
                ],
                confidence: 0.85,
                isCorrection: true
            },
            CONFIRMATION: {
                patterns: [
                    /\b(yes|yeah|correct|right|exactly|sure|absolutely|definitely)\b/i
                ],
                confidence: 0.9,
                isConfirmation: true
            },
            NEGATION: {
                patterns: [
                    /\b(no|nope|not|don't|wrong|incorrect)\b/i
                ],
                confidence: 0.9,
                isNegation: true
            }
        };
    }

    initializeEntityExtractors() {
        return {
            topic: (text) => {
                // Extract subject after "about", "is", etc.
                const match = text.match(/(?:about|is|was|my)\s+(\w+(?:\s+\w+){0,3})/i);
                return match ? match[1].trim() : null;
            },
            value: (text) => {
                // Extract value after "is" or verb
                const match = text.match(/(?:is|are|was|were|=)\s+(.+?)(?:\.|$)/i);
                return match ? match[1].trim() : null;
            },
            targetLang: (text) => {
                const langMap = {
                    'spanish': 'es', 'french': 'fr', 'german': 'de', 
                    'italian': 'it', 'portuguese': 'pt', 'chinese': 'zh',
                    'japanese': 'ja', 'korean': 'ko', 'russian': 'ru',
                    'hindi': 'hi', 'arabic': 'ar'
                };
                
                for (const [lang, code] of Object.entries(langMap)) {
                    if (text.includes(lang)) return code;
                }
                return 'en';
            },
            datetime: (text) => {
                // Extract time/date references
                const patterns = [
                    /\b(at|on)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i,
                    /\b(tomorrow|today|tonight|morning|evening|afternoon)\b/i,
                    /\b(in\s+(\d+)\s+(minutes?|hours?|days?))\b/i
                ];
                
                for (const pattern of patterns) {
                    const match = text.match(pattern);
                    if (match) return match[0];
                }
                return null;
            }
        };
    }

    async recognize(input, context) {
        const results = [];
        
        // Test against all intent patterns
        for (const [intentName, config] of Object.entries(this.intentPatterns)) {
            const match = this.matchIntent(input, config);
            if (match.matched) {
                results.push({
                    intent: intentName,
                    confidence: match.confidence,
                    entities: this.extractEntities(input, config.entities),
                    requiresInternet: config.requiresInternet || false,
                    requiresAction: config.requiresAction || false,
                    isCorrection: config.isCorrection || false
                });
            }
        }

        // Sort by confidence
        results.sort((a, b) => b.confidence - a.confidence);

        // Get best match
        let bestMatch = results[0] || {
            intent: 'UNKNOWN',
            confidence: 0.5,
            entities: {}
        };

        // Apply context boost if using context
        if (this.config.useContext && context) {
            bestMatch = this.applyContextBoost(bestMatch, context);
        }

        // Check threshold
        if (bestMatch.confidence < this.confidenceThreshold) {
            bestMatch.intent = 'UNKNOWN';
        }

        return bestMatch;
    }

    matchIntent(input, config) {
        let maxConfidence = 0;
        let matched = false;

        for (const pattern of config.patterns) {
            if (pattern.test(input)) {
                matched = true;
                // Calculate confidence based on match quality
                const match = input.match(pattern);
                const coverage = match[0].length / input.length;
                const confidence = config.confidence * (0.5 + coverage * 0.5);
                maxConfidence = Math.max(maxConfidence, confidence);
            }
        }

        return { matched, confidence: maxConfidence };
    }

    extractEntities(input, entityTypes = []) {
        const entities = {};
        
        for (const type of entityTypes) {
            if (this.entityExtractors[type]) {
                const value = this.entityExtractors[type](input);
                if (value) entities[type] = value;
            }
        }

        // Always try to extract datetime
        entities.datetime = this.entityExtractors.datetime(input);

        return entities;
    }

    applyContextBoost(match, context) {
        // Boost confidence if intent follows logically from previous
        if (context.recent && context.recent.length > 0) {
            const lastIntent = context.recent[context.recent.length - 1];
            
            // Contextual follow-ups
            const followUps = {
                'QUESTION': ['CONFIRMATION', 'NEGATION', 'QUESTION'],
                'GREETING': ['GREETING', 'QUESTION', 'COMMAND'],
                'MEMORY_STORE': ['CONFIRMATION']
            };

            if (followUps[lastIntent] && followUps[lastIntent].includes(match.intent)) {
                match.confidence = Math.min(1, match.confidence + 0.15);
            }
        }

        return match;
    }
}