// ============================================
// CORE SYSTEM: MEMORY MANAGER
// Advanced Memory Storage with Compression & Indexing
// ============================================

export class MemoryManager {
    constructor(config) {
        this.config = config;
        this.db = null;
        this.cache = new Map();
        this.index = new Map();
        this.compressionDict = new Map();
    }

    async initialize() {
        // Initialize IndexedDB for large storage
        this.db = await this.openDatabase();
        
        // Load indexes
        await this.loadIndexes();
        
        // Clean up old data
        await this.performMaintenance();
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('JarvisMemory', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Facts store
                if (!db.objectStoreNames.contains('facts')) {
                    const factStore = db.createObjectStore('facts', { keyPath: 'id', autoIncrement: true });
                    factStore.createIndex('topic', 'topic', { unique: false });
                    factStore.createIndex('timestamp', 'timestamp', { unique: false });
                    factStore.createIndex('confidence', 'confidence', { unique: false });
                }
                
                // Conversations store
                if (!db.objectStoreNames.contains('conversations')) {
                    const convStore = db.createObjectStore('conversations', { keyPath: 'id', autoIncrement: true });
                    convStore.createIndex('session', 'sessionId', { unique: false });
                    convStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Embeddings store for semantic search
                if (!db.objectStoreNames.contains('embeddings')) {
                    db.createObjectStore('embeddings', { keyPath: 'factId' });
                }
            };
        });
    }

    async setFact(key, value, metadata = {}) {
        const fact = {
            topic: key,
            value: this.compress(value),
            confidence: metadata.confidence || 1.0,
            timestamp: Date.now(),
            accessCount: 0,
            lastAccessed: Date.now(),
            source: metadata.source || 'user',
            tags: metadata.tags || []
        };

        // Check for existing fact
        const existing = await this.getFactRaw(key);
        if (existing) {
            // Update with confidence blending
            fact.confidence = this.blendConfidence(existing.confidence, fact.confidence);
            fact.id = existing.id;
        }

        await this.saveToStore('facts', fact);
        this.updateIndex(key, fact);
        
        return fact;
    }

    async getFact(key) {
        const fact = await this.getFactRaw(key);
        if (!fact) return null;
        
        // Update access metrics
        fact.accessCount++;
        fact.lastAccessed = Date.now();
        await this.saveToStore('facts', fact);
        
        return this.decompress(fact.value);
    }

    async getFactRaw(key) {
        const transaction = this.db.transaction(['facts'], 'readonly');
        const store = transaction.objectStore('facts');
        const index = store.index('topic');
        
        return new Promise((resolve, reject) => {
            const request = index.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async search(query, options = {}) {
        const { limit = 10, minConfidence = 0.5 } = options;
        
        // Search index
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const [key, fact] of this.index) {
            if (key.includes(queryLower) && fact.confidence >= minConfidence) {
                results.push({
                    key,
                    value: this.decompress(fact.value),
                    confidence: fact.confidence,
                    timestamp: fact.timestamp
                });
            }
        }
        
        // Sort by relevance (confidence + recency)
        results.sort((a, b) => {
            const scoreA = a.confidence * (1 + (a.timestamp / Date.now()));
            const scoreB = b.confidence * (1 + (b.timestamp / Date.now()));
            return scoreB - scoreA;
        });
        
        return results.slice(0, limit);
    }

    async saveConversation(message, sessionId) {
        const conversation = {
            sessionId,
            role: message.role,
            content: this.compress(message.content),
            timestamp: Date.now(),
            emotion: message.emotion,
            intent: message.intent
        };

        await this.saveToStore('conversations', conversation);
    }

    compress(data) {
        if (typeof data !== 'string') data = JSON.stringify(data);
        
        // Simple compression using dictionary
        let compressed = data;
        this.compressionDict.forEach((code, word) => {
            compressed = compressed.replace(new RegExp(word, 'g'), code);
        });
        
        return compressed;
    }

    decompress(data) {
        let decompressed = data;
        this.compressionDict.forEach((code, word) => {
            decompressed = decompressed.replace(new RegExp(code, 'g'), word);
        });
        
        try {
            return JSON.parse(decompressed);
        } catch {
            return decompressed;
        }
    }

    blendConfidence(oldConf, newConf) {
        // Bayesian update
        return (oldConf * 0.7) + (newConf * 0.3);
    }

    async saveToStore(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    updateIndex(key, fact) {
        this.index.set(key.toLowerCase(), fact);
    }

    async loadIndexes() {
        const transaction = this.db.transaction(['facts'], 'readonly');
        const store = transaction.objectStore('facts');
        const request = store.openCursor();
        
        return new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    this.updateIndex(cursor.value.topic, cursor.value);
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async performMaintenance() {
        // Remove low-confidence old facts
        const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
        
        const transaction = this.db.transaction(['facts'], 'readwrite');
        const store = transaction.objectStore('facts');
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(cutoff);
        
        const request = index.openCursor(range);
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const fact = cursor.value;
                if (fact.confidence < 0.3 && fact.accessCount < 5) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };
    }

    getStats() {
        return {
            facts: this.index.size,
            preferences: 0, // Calculate from prefs
            conversations: 0 // Calculate from DB
        };
    }

    getPreferences() {
        // Load from localStorage for quick access
        const prefs = localStorage.getItem('jarvis_prefs');
        return prefs ? JSON.parse(prefs) : {};
    }

    setPreference(key, value) {
        const prefs = this.getPreferences();
        prefs[key] = value;
        localStorage.setItem('jarvis_prefs', JSON.stringify(prefs));
    }

    save() {
        // Trigger manual save if needed
        console.log('Memory state saved');
    }

    saveSession(context) {
        localStorage.setItem('jarvis_last_session', JSON.stringify({
            timestamp: Date.now(),
            context: context
        }));
    }

    clear() {
        // Clear all stores
        const stores = ['facts', 'conversations', 'embeddings'];
        stores.forEach(storeName => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            store.clear();
        });
        this.index.clear();
    }
}
