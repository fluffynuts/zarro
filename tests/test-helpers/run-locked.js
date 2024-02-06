"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withLockedNuget = exports.runLocked = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redlock_1 = __importDefault(require("redlock"));
async function runLocked(lockName, options, toRun) {
    const redis = new ioredis_1.default({ host: "127.0.0.1" });
    try {
        const redlock = new redlock_1.default([redis]);
        if (toRun === undefined) {
            toRun = options;
            options = {
                maxLockDuration: 90000
            };
        }
        const opts = options;
        const redlockOptions = {
            retryDelay: 1000,
            retryCount: Math.round(opts.maxLockDuration / 1000)
        };
        await redlock.using([lockName], opts.maxLockDuration, redlockOptions, async (signal) => {
            if (signal.aborted) {
                throw new Error(`Unable to acquire lock:\n${signal.error}`);
            }
            await toRun();
        });
    }
    finally {
        redis.disconnect();
    }
}
exports.runLocked = runLocked;
async function withLockedNuget(toRun) {
    await toRun();
    return;
    // await runLocked(
    //   "nuget", {
    //     maxLockDuration: 60000
    //   }, toRun
    // )
}
exports.withLockedNuget = withLockedNuget;
