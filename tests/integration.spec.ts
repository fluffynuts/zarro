const spawn = require("../gulp-tasks/modules/spawn");
describe(`integration testing`, () => {
  it(`should be able to run with --show-env`, async () => {
    jest.setTimeout(15000);
    // Arrange
    const args = [
        "index.js",
        "--show-env"
      ],
      stdoutData: string[] = [];

    // Act
    await spawn("node", args, {
      stdout: (data: string) => stdoutData.push(data),
      stderr: (data: string) => console.error(data.toString())
    });
    // Assert
    expect(stdoutData.join(""))
      .toContain("BUILD_CONFIGURATION");
  });

  it(`should be able to run an npm task as if it were a gulp task`, async () => {
    // Arrange
    jest.setTimeout(15000);
    const args = [
      "index.js",
      "test-npm-gulp-task"
    ],
    stdoutData: string[] = [];
    // Act
    await spawn("node", args, {
      stdout: (data: string) => stdoutData.push(data.toString()),
      stderr: (data: string) => console.log(`stderr: ${data.toString()}`)
    });
    // Assert
    expect(stdoutData.join("\n"))
      .toContain("this is a test");
  });

});
