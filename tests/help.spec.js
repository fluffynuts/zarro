require("expect-even-more-jest");
const sut = require("../index-modules/handlers/help");

describe(`help`, () => {
  describe(`test function`, () => {
    describe(`when args contains -h`, () => {
      it(`should return true`, async () => {
        // Arrange
        const args = ["a", "b", "-h"];
        // Act
        const result = sut.test(args);
        // Assert
        expect(result).toBeTrue();
      });
    });
    describe(`when args contains --help`, () => {
      it(`should return true`, async () => {
        // Arrange
        const args = ["--help", "moo", "cow"];
        // Act
        const result = sut.test(args);
        // Assert
        expect(result).toBeTrue();
      });
    });
    describe(`otherwise`, () => {
      it(`should return false`, async () => {
        // Arrange
        const args = [ "build" ];
        // Act
        const result = sut.test(args);
        // Assert
        expect(result).toBeFalse();
      });
    });
  });
});
