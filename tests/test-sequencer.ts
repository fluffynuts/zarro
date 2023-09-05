import { ShardOptions } from "@jest/test-sequencer";
import { Test } from "@jest/test-result";

(function () {
  const debug = require("debug")("zarro::tests");
  const Sequencer = require("@jest/test-sequencer").default;
  const { stat } = require("yafs");
  const path = require("path");
  const { chopExtension } = require("../gulp-tasks/modules/path-utils");

  class ZarroTestSequencer
    extends Sequencer {
    /**
     * Select tests for shard requested via --shard=shardIndex/shardCount
     * Sharding is applied before sorting
     */
    shard(
      tests: Test[], shardOptions: ShardOptions) {
      const {
        shardCount,
        shardIndex
      } = shardOptions;
      const shardSize = Math.ceil(tests.length / shardCount);
      const shardStart = shardSize * (shardIndex - 1);
      const shardEnd = shardSize * shardIndex;

      return [ ...tests ]
        .sort((a, b) => (a.path > b.path ? 1 : -1))
        .slice(shardStart, shardEnd);
    }

    /**
     * Sort test to determine order of execution
     * Sorting is applied after sharding
     */
    async sort(tests: Test[]): Promise<Test[]> {
      // Test structure information
      // https://github.com/jestjs/jest/blob/6b8b1404a1d9254e7d5d90a8934087a9c9899dab/packages/jest-runner/src/types.ts#L17-L21
      const copy = Array.from(tests) as TestWithFileSize[];
      for (const item of copy) {
        const st = await stat(item.path);
        if (!st) {
          throw new Error(`Can't stat '${ item.path }'`);
        }
        item.fileSize = st.size;
      }
      const result = copy.sort((a: TestWithFileSize, b: TestWithFileSize) => {
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
      return result;
    }
  }

  interface TestWithFileSize
    extends Test {
    fileSize: number;
  }

  const prioritise = new Set<string>([
    "test-dotnet-logic",
    "dotnet-cli"
  ]);

  function isLess(
    a: TestWithFileSize,
    b: TestWithFileSize
  ): boolean {
    const aBaseName = specName(a.path);
    if (prioritise.has(aBaseName)) {
      debug(`'${a.path}' is prioritised`);
      return true;
    }

    if (a.path === b.path) {
      return false;
    }
    if (a.duration !== undefined && b.duration !== undefined) {
      return a.duration < b.duration;
    }
    return a.fileSize < b.fileSize;
  }

  function specName(
    p: string
  ) {
    const
      basename = path.basename(p);
    return chopExtension(basename).replace(/\.spec$/, "");
  }

  function isGreater(a: TestWithFileSize, b: TestWithFileSize): boolean {
    const bBaseName = specName(a.path);
    if (prioritise.has(bBaseName)) {
      debug(`'${b.path}' is prioritised`);
      return false;
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

  module.exports = ZarroTestSequencer;
})();
