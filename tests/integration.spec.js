const spawn = require("../gulp-tasks/modules/spawn");
describe(`integration testing`, () => {
  it(`should be able to run with --show-env`, async () => {
    // Arrange
    const args = [
      "--show-env"
    ],
    stdoutData = [];

    // Act
    await spawn("node", args, {
      stdout: data => stdoutData.push(data)
    });
    // Assert
    expect(stdoutData.join(""))
      .toContain("BUILD_CONFIGURATION");
  });

  function findStarterGulpFile() {
    return path.join(
      path.dirname(
        __dirname
      ), "gulp-tasks", "start", "gulpfile.js"
    );
  }
});
