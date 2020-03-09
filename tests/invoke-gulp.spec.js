const spawn = jest.fn("spawn");
jest.doMock("../../gulp-tasks/modules/spawn", spawn);
const
  which = require("which"),
  sut = require("../index-modules/handlers/invoke-gulp");

describe(`invoke-gulp`, () => {
  describe(`test fn`, () => {
    it(`should always return true (should be final queried)`, async () => {
      // Arrange
      // Act
      expect(sut.test([ 1, 1, 3 ])).toBeTrue();
      // Assert
    });
  });

  describe(`handler`, () => {
    it(`should invoke gulp with all the args`, async () => {
      // Arrange
      const
        args = [ "build", "test" ],
        gulp = await which("gulp");
      expect(gulp).toBeDefined();
      // Act
      await sut.handler(args);
      // Assert
      expect(spawn)
        .toHaveBeenCalledWith(gulp, args);
    });
  });
});
