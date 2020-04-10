const spawn = require("../gulp-tasks/modules/spawn");
describe(`integration testing`, () => {
  it(`should be able to run with --show-env`, async () => {
    // Arrange
    const args = [
      "index.js",
      "--show-env"
    ],
    stdoutData = [];

    // Act
    await spawn("node", args, {
      stdout: data => stdoutData.push(data),
      stderr: data => console.error(data.toString())
    });
    // Assert
    expect(stdoutData.join(""))
      .toContain("BUILD_CONFIGURATION");
  });

});
