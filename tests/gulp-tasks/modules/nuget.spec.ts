import "expect-even-more-jest";
import { faker } from "@faker-js/faker";

describe(`nuget`, () => {
  const systemMock = jest.fn();
  jest.doMock("../../../gulp-tasks/modules/system", () => systemMock);
  const tryDoMock = jest.fn();
  jest.doMock("../../../gulp-tasks/modules/try-do", () => tryDoMock);

  const
    SystemResult = requireModule<SystemResult>("system-result"),
    sut = requireModule<Nuget>("nuget");

  it(`should call through to system`, async () => {
    // Arrange
    const
      args = [ faker.word.sample(), faker.word.sample() ],
      opts = { timeout: 1234 } satisfies SystemOptions;
    // Act
    const result = await sut(args, opts);
    // Assert
    expect(result)
      .toEqual(stdout.concat(stderr).join("\n"));
    expect(systemMock)
      .toHaveBeenCalledOnceWith(
        expect.stringContaining("nuget"),
        args,
        expect.objectContaining({
          suppressOutput: true,
          timeout: 1234 + 50 /* a little buffer-space is given to execs so that timed-out execs can still have stdio gathered */
        })
      )
  });

  let stdout = [
      faker.word.sample(),
      faker.word.sample()
    ],
    stderr = [
      faker.word.sample(),
      faker.word.sample()
    ];
  beforeEach(() => {
    mockSystem();
  });

  function mockSystem() {
    systemMock.mockImplementation((exe: string, args?: string[], opts?: SystemOptions) => {
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
      return new SystemResult(
        exe,
        args || [],
        0,
        stdout,
        stderr
      );
    });
    tryDoMock.mockImplementation(async (fn: AsyncVoidVoid, envVar: string) => {
      return await fn();
    });
  }
});
