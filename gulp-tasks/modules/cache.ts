(function () {
  interface ICache {
    read<T>(key: string, fallback?: T): Optional<T>;

    write<T>(key: string, value: T, ttlSeconds: number): void;

    through<T>(
      key: string,
      generator: Func<Promise<T>>,
      ttlSeconds: number
    ): Promise<T>;

    throughSync<T>(
      key: string,
      generator: Func<T>,
      ttlSeconds: number
    ): T;

    create(): Cache;

    trim(): void;

    forget(key: string): void;

    clear(): void;
  }

  class CacheItem {
    constructor(
      public value: any,
      public expires: number
    ) {
    }
  }

  class Cache
    implements ICache {

    private _store = {} as Dictionary<CacheItem>;

    /**
     * reads a value from the cache
     * if the value is not found, the fallback, if supplied
     * is returned, otherwise undefined is returned
     * @param key
     * @param fallback
     */
    public read<T>(key: string, fallback?: T | undefined): Optional<T> {
      const cached = this._findCacheItem(key);
      return cached === undefined
        ? fallback
        : cached.value;
    }

    /**
     * clears all cached values
     */
    public clear(): void {
      this._store = {};
    }

    /**
     * stores a value in the cache
     * @param key
     * @param value
     * @param ttlSeconds
     */
    public write<T>(key: string, value: T, ttlSeconds: number): void {
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
    public async through<T>(key: string, generator: Func<Promise<T>>, ttlSeconds: number): Promise<T> {
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
    public throughSync<T>(key: string, generator: Func<T>, ttlSeconds: number): T {
      const cached = this._findCacheItem(key);
      if (cached) {
        return cached.value;
      }
      const result = generator();
      this.write(key, result, ttlSeconds);
      return result;
    }

    private _findCacheItem(key: string): CacheItem | undefined {
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
    public create(): Cache {
      return new Cache();
    }

    /**
     * trims expired items from the cache
     */
    public trim(): void {
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
    public forget(key: string): void {
      delete this._store[key];
    }
  }

  module.exports = new Cache();
})();
