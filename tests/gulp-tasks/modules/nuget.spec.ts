import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import * as systemWrapper from "system-wrapper";

describe(`nuget`, () => {
  const { spyOn } = jest;
  const realSystem = { ...systemWrapper };
  jest.doMock("system-wrapper", () => {
    return realSystem;
  });
  const tryDoMock = jest.fn();
  jest.doMock("../../../gulp-tasks/modules/try-do", () => tryDoMock);

  const
    sut = requireModule<Nuget>("nuget");

  it(`should call through to system`, async () => {
    // Arrange
    const
      args = [ faker.word.sample(), faker.word.sample() ],
      opts = { timeout: 1234 } satisfies SystemOptions,
      stderr = [] as string[],
      stdout = [] as string[];
    spyOn(realSystem, "system").mockImplementation(
      (exe, args?, opts?) => {
        return new Promise<SystemResult>(resolve => {
          stderr.push(faker.word.sample());
          stdout.push(faker.word.sample());
          if (typeof opts?.stdout === "function") {
            for (const line of stdout) {
              opts.stdout(line);
            }
          }
          if (typeof opts?.stderr === "function") {
            for (const line of stderr) {
              opts.stderr(line);
            }
          }
          const result = systemWrapper.SystemResult.create()
            .withExe(exe)
            .withArgs(args ?? [])
            .withExitCode(0)
            .withStdErr(stderr)
            .withStdOut(stdout)
            .build();
          resolve(result);
        });
      }
    );
    // Act
    const result = await sut(args, opts);
    // Assert
    expect(result)
      .toEqual(stdout.concat(stderr).join("\n"));
    expect(realSystem.system)
      .toHaveBeenCalledOnceWith(
        expect.stringContaining("nuget"),
        args,
        expect.objectContaining({
          suppressOutput: true,
          timeout: 1234 + 50 /* a little buffer-space is given to execs so that timed-out execs can still have stdio gathered */
        })
      )
  });

  beforeEach(() => {
    mockTryDo();
  });

  function mockTryDo() {
    tryDoMock.mockImplementation(async (fn: AsyncVoidVoid, envVar: string) => {
      return await fn();
    });
  }
});
