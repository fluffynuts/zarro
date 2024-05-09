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
        /**
         * reads a value from the cache
         * if the value is not found, the fallback, if supplied
         * is returned, otherwise undefined is returned
         * @param key
         * @param fallback
         */
        read(key, fallback) {
            const cached = this._findCacheItem(key);
            return cached === undefined
                ? fallback
                : cached.value;
        }
        /**
         * clears all cached values
         */
        clear() {
            this._store = {};
        }
        /**
         * stores a value in the cache
         * @param key
         * @param value
         * @param ttlSeconds
         */
        write(key, value, ttlSeconds) {
            this._store[key] = new CacheItem(value, Date.now() + ttlSeconds);
        }
        /**
         * Runs the generator if there is no cache item with
         * the provided key and stores the result. Subsequent
         * calls will skip the generator function to retrieve
         * from cache until the item expires.
         * @param key
         * @param generator
         * @param ttlSeconds
         */
        async through(key, generator, ttlSeconds) {
            const cached = this._findCacheItem(key);
            if (cached) {
                return cached.value;
            }
            const result = await generator();
            this.write(key, result, ttlSeconds);
            return result;
        }
        /**
         * Runs the generator if there is no cache item with
         * the provided key and stores the result. Subsequent
         * calls will skip the generator function to retrieve
         * from cache until the item expires.
         * @param key
         * @param generator
         * @param ttlSeconds
         */
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
        /**
         * creates a new empty cache
         */
        create() {
            return new Cache();
        }
        /**
         * trims expired items from the cache
         */
        trim() {
            for (const key of Object.keys(this._store)) {
                const item = this._store[key];
                if (item.expires < Date.now()) {
                    this.forget(key);
                }
            }
        }
        /**
         * forgets the cached item by key
         * @param key
         */
        forget(key) {
            delete this._store[key];
        }
    }
    module.exports = new Cache();
})();
