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

    read<T>(key: string, fallback?: T | undefined): Optional<T> {
      const cached = this._findCacheItem(key);
      return cached === undefined
        ? fallback
        : cached.value;
    }

    write<T>(key: string, value: T, ttlSeconds: number): void {
      const expires = Date.now() + ttlSeconds;
      this._store[key] = new CacheItem(value, Date.now() + ttlSeconds);
    }

    async through<T>(key: string, generator: Func<Promise<T>>, ttlSeconds: number): Promise<T> {
      const cached = this._findCacheItem(key);
      if (cached) {
        return cached.value;
      }
      const result = await generator();
      this.write(key, result, ttlSeconds);
      return result;
    }

    throughSync<T>(key: string, generator: Func<T>, ttlSeconds: number): T {
      const cached = this._findCacheItem(key);
      if (cached) {
        return cached.value;
      }
      const result = generator();
      this.write(key, result, ttlSeconds);
      return result;
    }

    private _findCacheItem(key: string): CacheItem | undefined {
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

    create(): Cache {
      return new Cache();
    }

    trim(): void {
      for (const key of Object.keys(this._store)) {
        const item = this._store[key];
        if (item.expires < Date.now()) {
          this.forget(key);
        }
      }
    }

    forget(key: string): void {
      delete this._store[key];
    }
  }

  module.exports = new Cache();
})();
