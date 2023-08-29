"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
describe(`testutil-finder`, () => {
    describe(`compareVersionArrays`, () => {
        const { compareVersionArrays } = requireModule("testutil-finder");
        it(`should return zero for two identical versions`, async () => {
            // Arrange
            const x = [1, 2, 3], y = [1, 2, 3];
            // Act
            const result = compareVersionArrays(x, y);
            // Assert
            expect(result)
                .toEqual(0);
        });
        it(`should return -1 when x > y`, async () => {
            // Arrange
            const x = [2, 0, 0], y = [1, 5, 6];
            // Act
            const result = compareVersionArrays(x, y);
            // Assert
            expect(result)
                .toEqual(-1);
        });
        it(`should return 1 when x < y`, async () => {
            // Arrange
            const x = [1, 4, 9], y = [1, 5, 1];
            // Act
            const result = compareVersionArrays(x, y);
            // Assert
            expect(result)
                .toEqual(1);
        });
        describe(`edge cases`, () => {
            const testCases = [
                { x: [1, 4, 9], y: [1, 5, 0, 1, 2], e: 1 },
                { x: [1, 2, 3, 4, 5], y: [1, 3], e: 1 }
            ];
            testCases.forEach((tc) => {
                it(`should ignore version numbers in y but not in x`, async () => {
                    // Arrange
                    const { x, y, e } = tc;
                    // Act
                    const result = compareVersionArrays(x, y);
                    // Assert
                    expect(result)
                        .toEqual(e);
                });
            });
        });
    });
});
