"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCacheKey = exports.recommendationCache = exports.patternCache = exports.statisticsCache = void 0;
class Cache {
    constructor() {
        this.cache = new Map();
    }
    set(key, data, ttl = 5 * 60 * 1000) {
        const entry = {
            data,
            timestamp: Date.now(),
            ttl
        };
        this.cache.set(key, entry);
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    clear() {
        this.cache.clear();
    }
    delete(key) {
        return this.cache.delete(key);
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
}
exports.statisticsCache = new Cache();
exports.patternCache = new Cache();
exports.recommendationCache = new Cache();
const generateCacheKey = (lotteryType, ...params) => {
    return `${lotteryType}_${params.map(p => JSON.stringify(p)).join('_')}`;
};
exports.generateCacheKey = generateCacheKey;
