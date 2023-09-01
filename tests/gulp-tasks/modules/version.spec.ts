import "expect-even-more-jest";

describe(`version`, () => {
  /**
   * Largely tested indirectly via testutil-finder.spec.ts / compareVersionArrays,
   * but there are some specifics here
   */
  const sut = requireModule<Version>("version");

  describe(`isLessThan`, () => {
    [
      {
        left: create("1.2.3"),
        right: create("2.0.0")
      },
      {
        left: create("1.2.3"),
        right: "2.0.0"
      },
      {
        left: create("1.2.3"),
        right: create([2, 0, 0])
      }
    ].forEach(tc => {
      const {
        left,
        right
      } = tc;
      it(`should return true when ${left} is less than ${right}`, async () => {
        // Arrange
        // Act
        const result = left.isLessThan(right);
        // Assert
        expect(result)
          .toBeTrue();
      });
    });
    [
      {
        left: create("1.2.3"),
        right: create("1.2.3")
      },
      {
        left: create("1.2.3"),
        right: "1.2.3"
      },
      {
        left: create("1.2.3"),
        right: create([1, 2, 3])
      }
    ].forEach(tc => {
      const {
        left,
        right
      } = tc;
      it(`should return false when equal`, async () => {
        // Arrange
        // Act
        const result = left.isLessThan(right);
        // Assert
        expect(result)
          .toBeFalse();
      });
    });

    [
      {
        left: create("2.2.3"),
        right: create("1.5.0")
      },
      {
        left: create("2.2.3"),
        right: "2.0.0"
      },
      {
        left: create("2.2.3"),
        right: create([1, 8, 0])
      }
    ].forEach(tc => {
      const {
        left,
        right
      } = tc;
      it(`should return false when greater`, async () => {
        // Arrange
        // Act
        const result = left.isLessThan(right);
        // Assert
        expect(result)
          .toBeFalse();
      });
    });
  });

  describe(`isGreaterThan`, () => {
    [
      {
        left: create("1.2.3"),
        right: create("2.0.0")
      },
      {
        left: create("1.2.3"),
        right: "2.0.0"
      },
      {
        left: create("1.2.3"),
        right: create([2, 0, 0])
      }
    ].forEach(tc => {
      const {
        left,
        right
      } = tc;
      it(`should return false when ${left} is less than ${right}`, async () => {
        // Arrange
        // Act
        const result = left.isGreaterThan(right);
        // Assert
        expect(result)
          .toBeFalse();
      });
    });
    [
      {
        left: create("1.2.3"),
        right: create("1.2.3")
      },
      {
        left: create("1.2.3"),
        right: "1.2.3"
      },
      {
        left: create("1.2.3"),
        right: create([1, 2, 3])
      }
    ].forEach(tc => {
      const {
        left,
        right
      } = tc;
      it(`should return false when equal`, async () => {
        // Arrange
        // Act
        const result = left.isGreaterThan(right);
        // Assert
        expect(result)
          .toBeFalse();
      });
    });

    [
      {
        left: create("2.2.3"),
        right: create("1.5.0")
      },
      {
        left: create("2.2.3"),
        right: "2.0.0"
      },
      {
        left: create("2.2.3"),
        right: create([1, 8, 0])
      }
    ].forEach(tc => {
      const {
        left,
        right
      } = tc;
      it(`should return true when greater`, async () => {
        // Arrange
        // Act
        const result = left.isGreaterThan(right);
        // Assert
        expect(result)
          .toBeTrue();
      });
    });
  });

  function create(ver: string | number[]): Version {
    return new sut(ver);
  }
});
