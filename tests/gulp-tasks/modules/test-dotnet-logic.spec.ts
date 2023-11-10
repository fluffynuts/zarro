const realSystem = requireModule<System>("system");
const fakeSystem = jest.fn();
jest.doMock("../../../gulp-tasks/modules/system", () => fakeSystem);
import "expect-even-more-jest";
import { FsEntities, ls } from "yafs";
import * as path from "path";

const SystemError = requireModule<SystemError>("system-error");

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
      // Arrange
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
    }, 30000);
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
      // Arrange
      process.env.FORCE_TEST_FAILURE = "1";
      process.env.DOTNET_TEST_REBUILD = "1";
      const stdout = [] as string[];
      const stderr = [] as string[];
      const originalLog = console.log.bind(console);
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
        skipped: 1
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
        skipped: -1
      };

      // originalLog("--- start full stdout dump ---");
      // originalLog(stdout.join("\n"));
      // originalLog("--- end full stdout dump ---");
      for (const line of stdout) {

        if (line.toLowerCase().includes("test results")) {
          inSummary = true;
          continue;
        }
        if (!inSummary) {
          continue;
        }
        if (tryParse(line, passedRe, (i: number) => results.passed = i)) {
          continue;
        }
        if (tryParse(line, totalRe, (i: number) => results.total = i)) {
          continue;
        }
        if (tryParse(line, skippedRe, (i: number) => results.skipped = i)) {
          continue;
        }
        tryParse(line, failedRe, (i: number) => results.failed = i);
      }
      expect(results)
        .toEqual(expected);
    }, 6000000);
  });

  const passedRe = /^\s*passed:\s*(?<value>\d+)\s*$/i;
  const totalRe = /^\s*total:\s*(?<value>\d+)\s*$/i;
  const failedRe = /^\s*failed:\s*(?<value>\d+)\s*$/i;
  const skippedRe = /^\s*skipped:\s*(?<value>\d+)\s*$/i;

  function tryParse(
    line: string,
    re: RegExp,
    callback: (i: number) => void
  ): boolean {
    const match = line.match(re);
    if (!match || !match.groups) {
      return false;
    }
    callback(parseInt(match.groups["value"]));
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
    // await Sandbox.destroyAll();
  });

});
