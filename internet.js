// ============================================
// MODULE: INTERNET SEARCH
// Web Search & API Integration
// ============================================

export class InternetSearch {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.rateLimiter = new Map();
    }

    async search(query, options = {}) {
        // Check cache
        const cached = this.getFromCache(query);
        if (cached) return cached;

        // Rate limiting
        if (this.isRateLimited('search')) {
            return { error: 'Rate limit exceeded. Please try again later.' };
        }

        try {
            // Use multiple search strategies
            const results = await Promise.all([
                this.searchDuckDuckGo(query),
                this.searchWikipedia(query),
                options.news ? this.searchNews(query) : null
            ]);

            const combined = this.combineResults(results.filter(r => r));
            this.addToCache(query, combined);
            
            return combined;

        } catch (error) {
            console.error('Search error:', error);
            return { error: 'Search failed. Please check your connection.' };
        }
    }

    async searchDuckDuckGo(query) {
        try {
            const response = await fetch(
                `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
                { headers: { 'Accept': 'application/json' } }
            );
            
            const data = await response.json();
            
            return {
                source: 'DuckDuckGo',
                abstract: data.AbstractText,
                url: data.AbstractURL,
                related: data.RelatedTopics?.slice(0, 5).map(t => ({
                    title: t.Text?.split(' - ')[0],
                    description: t.Text?.split(' - ')[1]
                })),
                image: data.Image
            };
        } catch (e) {
            return null;
        }
    }

    async searchWikipedia(query) {
        try {
            const response = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
            );
            
            const data = await response.json();
            
            return {
                source: 'Wikipedia',
                title: data.title,
                extract: data.extract,
                url: data.content_urls?.desktop?.page,
                image: data.thumbnail?.source
            };
        } catch (e) {
            return null;
        }
    }

    async searchNews(query) {
        // Would integrate with news API
        return null;
    }

    async getWeather(location) {
        // Use Open-Meteo (free, no key required)
        try {
            // First geocode location
            const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
            );
            const geoData = await geoResponse.json();
            
            if (!geoData.results?.[0]) {
                return { error: 'Location not found' };
            }

            const { latitude, longitude, name } = geoData.results[0];

            // Get weather
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
            );
            
            const weatherData = await weatherResponse.json();
            
            return {
                location: name,
                current: weatherData.current_weather,
                daily: weatherData.daily,
                unit: 'celsius'
            };

        } catch (error) {
            return { error: 'Weather service unavailable' };
        }
    }

    combineResults(results) {
        // Merge and deduplicate results
        const combined = {
            sources: [],
            answer: '',
            related: [],
            images: []
        };

        results.forEach(result => {
            if (result.abstract || result.extract) {
                combined.answer = result.abstract || result.extract;
            }
            combined.sources.push({
                name: result.source,
                url: result.url
            });
            if (result.related) {
                combined.related.push(...result.related);
            }
            if (result.image) {
                combined.images.push(result.image);
            }
        });

        return combined;
    }

    getFromCache(query) {
        const cached = this.cache.get(query);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        this.cache.delete(query);
        return null;
    }

    addToCache(query, data) {
        this.cache.set(query, {
            data,
            timestamp: Date.now()
        });
    }

    isRateLimited(action) {
        const lastCall = this.rateLimiter.get(action);
        const now = Date.now();
        
        if (lastCall && now - lastCall < 1000) { // 1 second between calls
            return true;
        }
        
        this.rateLimiter.set(action, now);
        return false;
    }
}