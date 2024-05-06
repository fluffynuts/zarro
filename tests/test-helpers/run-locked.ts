import RedisClient from "ioredis";
import Redlock, { RedlockAbortSignal } from "redlock";

export interface LockOptions {
    maxLockDuration: number;
}


export async function runLocked(
  lockName: string,
  options: LockOptions | AsyncVoidVoid,
  toRun?: AsyncVoidVoid
) {
  const redis = new RedisClient({ host: "127.0.0.1"});
  try {
    const redlock = new Redlock([redis]);
    if (toRun === undefined) {
      toRun = options as AsyncVoidVoid;
      options = {
        maxLockDuration: 90000
      }
    }
    const opts = options as LockOptions;
    const redlockOptions = {
      retryDelay: 1000,
      retryCount: Math.round(opts.maxLockDuration / 1000)
    }
    await redlock.using(
      [lockName],
      opts.maxLockDuration,
      redlockOptions,
      async (signal: RedlockAbortSignal) => {
        if (signal.aborted) {
          throw new Error(`Unable to acquire lock:\n${signal.error}`);
        }
        await (toRun as AsyncVoidVoid)();
      }
    );
  } finally {
    redis.disconnect();
  }
}

export async function withLockedNuget(
  toRun: AsyncVoidVoid
) {
  await runLocked(
    "nuget", {
      maxLockDuration: 90000
    }, toRun
  )
}
