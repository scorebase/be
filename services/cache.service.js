const cache = require('../lib/cache/cache');

const ONE_HOUR = 60 * 60;

class CacheService {
    constructor(kind = '', ttl = ONE_HOUR) {
        this.cache = cache;
        this.kind = kind ? kind + '_' : '';
        this.ttl = ttl;
    }

    formatKey(key) {
        return this.kind + key;
    }

    load(key) {
        const value = this.cache.get(this.formatKey(key));
        if(!value) {
            return null;
        }
        return value;
    }

    insert(key, value) {
        return this.cache.set(this.formatKey(key), value, this.ttl);
    }

    remove(key) {
        this.cache.del(this.formatKey(key));
    }

    removeMultiple(keys) {
        const keysToDelete = keys.map(k => this.formatKey(k));
        this.cache.del(keysToDelete);
    }

    keys() {
        return this.cache.keys();
    }

    flushAll() {
        return this.cache.flushAll();
    }

    loadStats() {
        return this.cache.getStats();
    }
}

module.exports = CacheService;