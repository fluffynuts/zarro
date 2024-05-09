"use strict";
(function () {
    class CacheItem {
        constructor(value, expires) {
            this.value = value;
            this.expires = expires;
        }
    }
    class Cache {
        constructor() {
            this._store = {};
        }
        read(key, fallback) {
            const cached = this._findCacheItem(key);
            return cached === undefined
                ? fallback
                : cached.value;
        }
        write(key, value, ttlSeconds) {
            const expires = Date.now() + ttlSeconds;
            this._store[key] = new CacheItem(value, Date.now() + ttlSeconds);
        }
        async through(key, generator, ttlSeconds) {
            const cached = this._findCacheItem(key);
            if (cached) {
                return cached.value;
            }
            const result = await generator();
            this.write(key, result, ttlSeconds);
            return result;
        }
        throughSync(key, generator, ttlSeconds) {
            const cached = this._findCacheItem(key);
            if (cached) {
                return cached.value;
            }
            const result = generator();
            this.write(key, result, ttlSeconds);
            return result;
        }
        _findCacheItem(key) {
            debugger;
            const result = this._store[key];
            if (result === undefined) {
                return undefined;
            }
            if (result.expires < Date.now()) {
                this.forget(key);
                return undefined;
            }
            return result;
        }
        create() {
            return new Cache();
        }
        trim() {
            for (const key of Object.keys(this._store)) {
                const item = this._store[key];
                if (item.expires < Date.now()) {
                    this.forget(key);
                }
            }
        }
        forget(key) {
            delete this._store[key];
        }
    }
    module.exports = new Cache();
})();
