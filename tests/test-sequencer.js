"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    const debug = require("debug")("zarro::tests");
    const Sequencer = require("@jest/test-sequencer").default;
    const { stat } = require("yafs");
    const path = require("path");
    const { chopExtension } = require("../gulp-tasks/modules/path-utils");
    class ZarroTestSequencer extends Sequencer {
        /**
         * Select tests for shard requested via --shard=shardIndex/shardCount
         * Sharding is applied before sorting
         */
        shard(tests, shardOptions) {
            const { shardCount, shardIndex } = shardOptions;
            const shardSize = Math.ceil(tests.length / shardCount);
            const shardStart = shardSize * (shardIndex - 1);
            const shardEnd = shardSize * shardIndex;
            return [...tests]
                .sort((a, b) => (a.path > b.path ? 1 : -1))
                .slice(shardStart, shardEnd);
        }
        /**
         * Sort test to determine order of execution
         * Sorting is applied after sharding
         */
        async sort(tests) {
            // Test structure information
            // https://github.com/jestjs/jest/blob/6b8b1404a1d9254e7d5d90a8934087a9c9899dab/packages/jest-runner/src/types.ts#L17-L21
            const copy = Array.from(tests);
            for (const item of copy) {
                const st = await stat(item.path);
                if (!st) {
                    throw new Error(`Can't stat '${item.path}'`);
                }
                item.fileSize = st.size;
            }
            const result = copy.sort((a, b) => {
                if (isLess(a, b)) {
                    debug(`${a.path} < ${b.path}`);
                    return -1;
                }
                if (isGreater(a, b)) {
                    debug(`${a.path} > ${b.path}`);
                    return 1;
                }
                debug(`${a.path} == ${b.path}`);
                return 0;
            });
            debug("sorted result", result.map(t => t.path));
            return result;
        }
    }
    const prioritise = [
        "test-dotnet-logic",
        "integrations",
        "find-local-nuget",
        "nuget-update-self"
    ];
    function isLess(a, b) {
        const aBaseName = specName(a.path), bBaseName = specName(b.path), aIndex = prioritise.indexOf(aBaseName), bIndex = prioritise.indexOf(bBaseName);
        if (aIndex > -1) {
            if (bIndex > -1) {
                if (bIndex < aIndex) {
                    logWinner(b, a);
                    return false;
                }
                else {
                    logWinner(a, b);
                    return true;
                }
            }
            else {
                logWinner(a, b);
                return true;
            }
        }
        else if (bIndex > -1) {
            logWinner(b, a);
            return false;
        }
        if (a.path === b.path) {
            return false;
        }
        if (a.duration !== undefined && b.duration !== undefined) {
            return a.duration < b.duration;
        }
        return a.fileSize < b.fileSize;
    }
    function logWinner(winner, loser) {
        debug(`'${winner.path}' is prioritised over '${loser.path}'`);
    }
    function isGreater(a, b) {
        const aBaseName = specName(a.path), bBaseName = specName(b.path), aIndex = prioritise.indexOf(aBaseName), bIndex = prioritise.indexOf(bBaseName);
        if (aIndex > -1) {
            if (bIndex > -1) {
                if (bIndex < aIndex) {
                    logWinner(b, a);
                    return true;
                }
                else {
                    logWinner(a, b);
                    return false;
                }
            }
            else {
                logWinner(a, b);
                return false;
            }
        }
        else if (bIndex > -1) {
            logWinner(b, a);
            return true;
        }
        if (a.path === b.path) {
            return false; // why are there 2? who knows.
        }
        // lean on prior durations, if available
        if (a.duration !== undefined && b.duration !== undefined) {
            return a.duration > b.duration;
        }
        return a.fileSize > b.fileSize;
    }
    function specName(p) {
        const basename = path.basename(p);
        return chopExtension(basename).replace(/\.spec$/, "");
    }
    module.exports = ZarroTestSequencer;
})();
