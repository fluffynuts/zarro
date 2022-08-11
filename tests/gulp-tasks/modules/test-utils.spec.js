"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const ev = "DOTNET_TEST_PREFIXES";
describe(`test-utils`, () => {
    describe(`resolveTestPrefixFor`, () => {
        const { resolveTestPrefixFor } = requireModule("test-utils");
        const env = requireModule("env");
        it(`should be a function`, async () => {
            // Arrange
            // Act
            expect(resolveTestPrefixFor)
                .toBeFunction();
            // Assert
        });
        describe(`when no env var set`, () => {
            it(`should return empty string`, async () => {
                // Arrange
                delete process.env[ev];
                const project = "foo/bar/quux.csproj";
                // Act
                const result = resolveTestPrefixFor(project);
                // Assert
                expect(result)
                    .toEqual("");
            });
        });
        describe(`when var set for another project`, () => {
            it(`should return empty string`, async () => {
                // Arrange
                process.env[ev] = "demo:wibbles";
                const project = "foo/bar/quux.csproj";
                // Act
                const result = resolveTestPrefixFor(project);
                // Assert
                expect(result)
                    .toEqual("");
            });
        });
        describe(`when var set for the requested project`, () => {
            it(`should return the prefix`, async () => {
                // Arrange
                const expected = "moo.cakes";
                process.env[ev] = `demo:wibbles,quux:${expected}`;
                const project = "foo/bar/quux.csproj";
                // Act
                const result = resolveTestPrefixFor(project);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
    });
});
