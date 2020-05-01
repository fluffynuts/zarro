"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sut = require("../../../gulp-tasks/modules/increment-version");
require("expect-more-jest");
describe(`increment-version`, function () {
    it(`should be a function`, async () => {
        // Arrange
        // Act
        expect(sut).toBeFunction();
        // Assert
    });
    describe(`stragegy: major`, () => {
        it(`should increment major version`, async () => {
            // Arrange
            const input = "1.1.1", expected = "2.1.1";
            // Act
            const result = sut(input, "major", false);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should zero others if required`, async () => {
            // Arrange
            const input = "1.1.2", expected = "2.0.0";
            // Act
            const result = sut(input, "major", true);
            // Assert
            expect(result)
                .toEqual(expected);
        });
    });
    describe(`stragegy: minor`, () => {
        it(`should increment minor version`, async () => {
            // Arrange
            const input = "1.1.1", expected = "1.2.1";
            // Act
            const result = sut(input, "minor", false);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should zero others if required`, async () => {
            // Arrange
            const input = "1.1.2", expected = "1.2.0";
            // Act
            const result = sut(input, "minor", true);
            // Assert
            expect(result)
                .toEqual(expected);
        });
    });
    describe(`stragegy: patch`, () => {
        it(`should increment patch version`, async () => {
            // Arrange
            const input = "1.1.1", expected = "1.1.2";
            // Act
            const result = sut(input, "patch", false);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should not care about zeros`, async () => {
            // Arrange
            const input = "1.1.2", expected = "1.1.3";
            // Act
            const result = sut(input, "patch", true);
            // Assert
            expect(result)
                .toEqual(expected);
        });
    });
});
