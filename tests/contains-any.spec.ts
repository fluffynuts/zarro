import "expect-even-more-jest";
const containsAny = require("../index-modules/contains-any");

describe(`contains`, () => {
  describe(`given no args`, () => {
    it(`should return false`, async () => {
      // Arrange
      // Act
      const result = containsAny();
      // Assert
      expect(result).toBeFalse();
    });
  });
  describe(`given array and nothing to search for`, () => {
    it(`should return true`, async () => {
      // Arrange
      // Act
      const result = containsAny([1, 2, 3]);
      // Assert
      expect(result).toBeTrue();
    });
  });
  describe(`given array and one item not in array`, () => {
    it(`should return false`, async () => {
      // Arrange
      // Act
      const result = containsAny([1, 2, 3], 4);
      // Assert
      expect(result).toBeFalse();
    });
  });
  describe(`given array and one item in array`, () => {
    it(`should return true`, async () => {
      // Arrange
      // Act
      const result = containsAny([1, 2, 3], 1);
      // Assert
      expect(result).toBeTrue();
    });
  });
  describe(`given array and two items`, () => {
    describe(`when none in array`, () => {
      it(`should return false;`, async () => {
        // Arrange
        // Act
        const result = containsAny([1, 2, 3], 4, 5);
        // Assert
        expect(result).toBeFalse();
      });
    });
    describe(`when first is in array`, () => {
      it(`should return true`, async () => {
        // Arrange
        // Act
        const result = containsAny([1, 2, 3], 1, 5);
        // Assert
        expect(result).toBeTrue();
      });
    });
    describe(`when any other is in array`, () => {
      it(`should return true`, async () => {
        // Arrange
        // Act
        const result = containsAny([1, 2, 3], 5, 6, 7, 8, 9, 1);
        // Assert
        expect(result).toBeTruthy();
      });
    });
    describe(`when all are in array`, () => {
      it(`should return true`, async () => {
        // Arrange
        // Act
        const result = containsAny([1, 2, 3], 1, 2, 3);
        // Assert
        expect(result).toBeTrue();
      });
    });
  });
});
