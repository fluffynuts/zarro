import "expect-even-more-jest";
describe(`invoke-gulp`, () => {
  const
    spawn = jest.fn(),
    requireModule = require("../gulp-tasks/modules/require-module");
  requireModule.mock("spawn", spawn);

  const
    path = require("path"),
    isFile = require("../index-modules/is-file"),
    sut = require("../index-modules/handlers/invoke-gulp");

  describe(`test fn`, () => {
    it(`should always return true (should be final queried)`, async () => {
      // Arrange
      // Act
      expect(sut.test([ 1, 1, 3 ])).toBeTrue();
      // Assert
    });
  });

  function findStarterGulpFile() {
    return path.join(
      path.dirname(
        __dirname
      ), "gulp-tasks", "start", "gulpfile.js"
    );
  }

  describe(`handler`, () => {
    it(`should invoke gulp with all the args`, async () => {
      // Arrange
      const
        args = [ "build", "test" ],
        gulpFile = findStarterGulpFile(),
        expected = [ "--gulpfile", gulpFile, "--cwd", process.cwd() ].concat(args);
      // Act
      await sut.handler(args);
      // Assert
      expect(spawn)
        .toHaveBeenCalledTimes(1);
      const
        calledArgs = spawn.mock.calls[0],
        usedGulp = calledArgs[0],
        processArgs = calledArgs[1];
      expect(usedGulp)
        .toBeDefined();
      expect((await isFile(usedGulp)))
        .toBeTrue();
      expect(processArgs)
        .toEqual(expected);
    });
  });
});
