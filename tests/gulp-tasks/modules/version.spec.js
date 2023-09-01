"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
describe(`version`, () => {
    /**
     * Largely tested indirectly via testutil-finder.spec.ts / compareVersionArrays,
     * but there are some specifics here
     */
    const sut = requireModule("version");
    describe(`constructors`, () => {
        it(`should construct from a string`, async () => {
            // Arrange
            // Act
            const sut = create("1.2.3-beta1");
            // Assert
            expect(sut.version)
                .toEqual([1, 2, 3]);
            expect(sut.tag)
                .toEqual("beta1");
            expect(sut.isPreRelease)
                .toBeTrue();
        });
        it(`should construct from an array of numbers`, async () => {
            // Arrange
            // Act
            const sut = create([3, 4, 5]);
            // Assert
            expect(sut.version)
                .toEqual([3, 4, 5]);
            expect(sut.tag)
                .toEqual("");
            expect(sut.isPreRelease)
                .toBeFalse();
        });
        it(`should construct from version parts`, async () => {
            // Arrange
            // Act
            const sut = create(1, 2, 3, "beta1");
            // Assert
            expect(sut.version)
                .toEqual([1, 2, 3]);
            expect(sut.major)
                .toEqual(1);
            expect(sut.minor)
                .toEqual(2);
            expect(sut.patch)
                .toEqual(3);
            expect(sut.tag)
                .toEqual("beta1");
        });
        it(`should fall back on zeros`, async () => {
            // Arrange
            // Act
            const sut = create(3);
            // Assert
            expect(sut.version)
                .toEqual([3, 0, 0]);
        });
        it(`should construct from VersionInfo`, async () => {
            // Arrange
            // Act
            const sut = create({
                major: 1,
                minor: 2,
                patch: 3,
                tag: "beta4"
            });
            // Assert
            expect(sut.toString())
                .toEqual("1.2.3-beta4");
        });
    });
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
            const { left, right } = tc;
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
            const { left, right } = tc;
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
            const { left, right } = tc;
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
            const { left, right } = tc;
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
            const { left, right } = tc;
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
            const { left, right } = tc;
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
    function create(ver, minor, patch, tag) {
        if (typeof ver === "number") {
            return new sut(ver, minor, patch, tag);
        }
        else {
            return new sut(ver);
        }
    }
});
