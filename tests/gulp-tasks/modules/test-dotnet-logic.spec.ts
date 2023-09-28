const realSystem = requireModule<System>("system");
const fakeSystem = jest.fn();
jest.doMock("../../../gulp-tasks/modules/system", () => fakeSystem);
import "expect-even-more-jest";
import { FsEntities, ls } from "yafs";
import * as path from "path";

const SystemError = requireModule<SystemError>("system-error");
const SystemResult = requireModule<SystemResult>("system-result");

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
      expect(result.exitCode)
        .toEqual(0);
      expect(result.stdout.find(
        line => line.match(/^total tests: \d+/i)
      )).toExist();
      expect(result.stdout.find(
        line => line.match(/^\s+passed: \d+/i)
      )).toExist();
      const args = fakeSystem.mock.calls[0];
      let nextShouldBeNormal = false;
      for (const arg of args) {
        if (arg === "--verbosity") {
          nextShouldBeNormal = true;
          continue;
        }
        if (!nextShouldBeNormal) {
          continue;
        }
        expect(arg)
          .toEqual("normal");
        break;
      }
    }, 30000);
  });

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
