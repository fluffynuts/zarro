import { Sandbox } from "filesystem-sandbox";

const realSystem = requireModule<System>("system");
const fakeSystem = jest.fn();
jest.doMock("../../../gulp-tasks/modules/system", () => fakeSystem);
import "expect-even-more-jest";
import { FsEntities, ls } from "yafs";
import * as path from "path";
import { withLockedNuget } from "../../test-helpers/run-locked";
import { shouldSkipSlowNetworkTests } from "../../test-helpers/should-skip-slow-network-tests";

const SystemError = requireModule<SystemError>("system-error");

if (shouldSkipSlowNetworkTests()) {
  describe(`test-dotnet-logic`, () => {
    it(`skipping tests`, async () => {
      // Arrange
      // Act
      expect(true).toBeTrue();
      // Assert
    });
  });
} else {
  describe(`test-dotnet-logic`, () => {
    describe(`testOneDotNetCoreProject`, () => {
      beforeEach(() => {
        fakeSystem.mockImplementation((
          exe: string,
          args?: string[],
          options?: SystemOptions
        ) => realSystem(exe, args, options));
        const hax = fakeSystem as any;
        hax.isError = (arg: any) => arg instanceof SystemError;
        hax.isSystemError = hax.isError;
      });
      const { testOneDotNetCoreProject } = requireModule<TestDotNetLogic>("test-dotnet-logic");

      it(`should test the project`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          process.env.FORCE_TEST_FAILURE = "0";
          spyOn(console, "log");
          const
            project = await findProject(
              "Project1.Tests"
            ),
            testResults = {
              quackersEnabled: true,
              failed: 0,
              skipped: 0,
              failureSummary: [],
              slowSummary: [],
              started: 0,
              passed: 0,
              fullLog: []
            } satisfies TestResults;
          // Act
          const result = await testOneDotNetCoreProject(
            project,
            "Debug",
            "normal",
            testResults,
            true,
            true,
            true
          );
          // Assert
          // tests below depend on output from
          if (result.exitCode !== 0) {
            console.warn(result.stdout.join("\n"));
          }
          expect(result.exitCode)
            .toEqual(0);

          // assumes the standard zarro log prefix of ::
          expect(result.stdout.find(
            line => line.match(/:quackers_log:total:\s+\d+/i)
          )).toExist();
          expect(result.stdout.find(
            line => line.match(/:quackers_log:passed:\s+\d+/i)
          )).toExist();
          const args = fakeSystem.mock.calls[0];
          let nextIsVerbosity = false;
          for (const arg of args) {
            if (arg === "--verbosity") {
              nextIsVerbosity = true;
              continue;
            }
            if (!nextIsVerbosity) {
              continue;
            }
            expect(arg)
              .toEqual("quiet");
            break;
          }
        });
      }, 90000);
    });

    describe(`testAsDotNetCore`, () => {
      const { testAsDotNetCore } = requireModule<TestDotNetLogic>("test-dotnet-logic");
      beforeEach(() => {
        fakeSystem.mockImplementation((
          exe: string,
          args?: string[],
          options?: SystemOptions
        ) => realSystem(exe, args, options));
        const hax = fakeSystem as any;
        hax.isError = (arg: any) => arg instanceof SystemError;
        hax.isSystemError = hax.isError;

      });

      it(`should report the correct totals`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          process.env.FORCE_TEST_FAILURE = "1";
          process.env.DOTNET_TEST_REBUILD = "1";
          const stdout = [] as string[];
          const stderr = [] as string[];
          const originalError = console.error.bind(console);
          spyOn(console, "log").and.callFake(
            (line: string) => stdout.push(...line.split("\n").map(l => l.replace(/\r$/, "")))
          );
          spyOn(console, "error").and.callFake(
            (line: string) => stderr.push(line)
          );
          const project1 = await findProject("Project1.Tests");
          const project2 = await findProject("Project2.Tests");
          const expected = {
            total: 6,
            passed: 3,
            failed: 2,
            skipped: 1,
            slow: 1
          };
          // Act
          try {
            await testAsDotNetCore("Debug", [ project1, project2 ])
          } catch (e) {
            // suppress - test _should_ throw if there are failures
          }
          // Assert
          let inSummary = false;
          const results = {
            total: -1,
            passed: -1,
            failed: -1,
            skipped: -1,
            slow: -1
          };

          // originalLog("--- start full stdout dump ---");
          // originalLog(stdout.join("\n"));
          // originalLog("--- end full stdout dump ---");
          let foundTotal = false;
          let foundPassed = false;
          let foundFailed = false;
          let foundSkipped = false;
          let foundSlow = false;
          let foundTotals = false;
          const parseLog = [] as string[];

          for (const line of stdout) {

            if (line.toLowerCase().includes("overall result:")) {
              inSummary = true;
              continue;
            }
            if (!inSummary) {
              continue;
            }
            foundTotal ||= tryParse(line, totalRe, (i: number) => results.total = i, parseLog);
            foundPassed ||= tryParse(line, passedRe, (i: number) => results.passed = i, parseLog);
            foundFailed ||= tryParse(line, failedRe, (i: number) => results.failed = i, parseLog);
            foundSkipped ||= tryParse(line, skippedRe, (i: number) => results.skipped = i, parseLog);
            foundSlow ||= tryParse(line, slowRe, (i: number) => results.slow = i, parseLog);

            foundTotals = foundPassed &&
                          foundTotal &&
                          foundSkipped &&
                          foundFailed &&
                          foundSlow;
            if (foundTotals) {
              inSummary = false;
              break;
            }
          }
          console.error({
            foundPassed,
            foundTotal,
            foundSkipped,
            foundFailed,
            foundSlow,
            results
          });
          if (!foundTotals || results.total < 1) {
            originalError("no totals found");
            originalError(`[raw stdout]\n${ stdout.join("\n") }`);
            originalError(`\n[parse logs]\n${ parseLog.join("\n") }`);
          }
          expect(results)
            .toEqual(expected);
        });
      }, 90000);
    });

    const totalRe = /\s*test count:\s*(?<value>\d+)/i;
    const passedRe = /\s*passed:\s*(?<value>\d+)/i;
    const failedRe = /\s*failed:\s*(?<value>\d+)/i;
    const skippedRe = /\s*skipped:\s*(?<value>\d+)/i;
    const slowRe = /\s*slow:\s*(?<value>\d+)/i;

    function tryParse(
      line: string,
      re: RegExp,
      callback: (i: number) => void,
      log?: string[]
    ): boolean {
      const match = line.match(re);
      if (!match || !match.groups) {
        if (log) {
          log.push(`no match for ${ re.toString() } on line: '${ line }'`);
          log.push(`   ${ JSON.stringify(match) }`);
        }
        return false;
      }
      const value = parseInt(match.groups["value"]);
      if (log) {
        log.push(`line '${ line }' is a match for ${ re.toString() } - calling callback with ${ value }`);
      }
      callback(value);
      return true;
    }

    async function findProject(
      name: string
    ): Promise<string> {
      const basedir =
        path.dirname(
          path.dirname(
            path.dirname(
              __dirname
            )
          )
        );
      const matches = await ls(
        basedir, {
          entities: FsEntities.files,
          recurse: true,
          match: new RegExp(`${name}\\.csproj$`),
          fullPaths: true
        }
      );
      const result = matches[0];
      if (!result) {
        throw new Error(`Can't find project: '${ name }' under '${ basedir }'`);
      }
      return matches[0];
    }

    afterAll(async () => {
      await Sandbox.destroyAll();
    });

  });
}
