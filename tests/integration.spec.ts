const system = requireModule<System>("system");
describe(`integration testing`, () => {
  it(`should be able to run with --show-env`, async () => {
    // Arrange
    const args = [
        "index.js",
        "--show-env"
      ],
      stdoutData: string[] = [];

    // Act
    await system("node", args, {
      stdout: (data: string) => stdoutData.push(data),
      stderr: (data: string) => {
      }
    });
    // Assert
    expect(stdoutData.join(""))
      .toContain("BUILD_CONFIGURATION");
  });

  it(`should be able to run an npm task as if it were a gulp task`, async () => {
    // Arrange
    const args = [
        "index.js",
        "test-npm-gulp-task"
      ],
      stdoutData: string[] = [];
    // Act
    try {
      await system("node", args, {
        stdout: (data: string) => stdoutData.push(data.toString()),
        stderr: (data: string) => {
        }
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
    // Assert
    expect(stdoutData.join("\n"))
      .toContain("this is a test");
  });

});
