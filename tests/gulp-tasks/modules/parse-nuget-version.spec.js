"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const { parseNugetVersion } = require("../../../gulp-tasks/modules/parse-nuget-version");
const Version = requireModule("version");
describe(`parse-nuget-package-filename`, () => {
    it(`should parse release file name`, async () => {
        // Arrange
        const input = "packageId.1.2.3.nupkg", expected = {
            id: "packageId",
            version: new Version(1, 2, 3, "")
        };
        // Act
        const result = parseNugetVersion(input);
        // Assert
        expect(result)
            .toEqual(expected);
    });
    it(`should parse release file name without the suffix`, async () => {
        // Arrange
        const input = "packageId.1.2.3", expected = {
            id: "packageId",
            version: new Version({
                major: 1,
                minor: 2,
                patch: 3,
                tag: ""
            })
        };
        // Act
        const result = parseNugetVersion(input);
        // Assert
        expect(result)
            .toEqual(expected);
    });
    it(`should parse pre-release file name`, async () => {
        // Arrange
        const input = "packageId.1.2.3-123123123.abc123.nupkg", expected = {
            id: "packageId",
            version: new Version({
                major: 1,
                minor: 2,
                patch: 3,
                tag: "123123123.abc123"
            })
        };
        // Act
        const result = parseNugetVersion(input);
        // Assert
        expect(result)
            .toEqual(expected);
    });
    it(`should parse when versions > 9`, async () => {
        // Arrange
        const input = "packageId.10.20.343-123123123.abc123.nupkg", expected = {
            id: "packageId",
            version: new Version({
                major: 10,
                minor: 20,
                patch: 343,
                tag: "123123123.abc123"
            })
        };
        // Act
        const result = parseNugetVersion(input);
        // Assert
        expect(result)
            .toEqual(expected);
    });
    it(`should parse package id with periods`, async () => {
        // Arrange
        const input = "package.Id.10.20.343-123123123.abc123.nupkg", expected = {
            id: "package.Id",
            version: new Version({
                major: 10,
                minor: 20,
                patch: 343,
                tag: "123123123.abc123"
            })
        };
        // Act
        const result = parseNugetVersion(input);
        // Assert
        expect(result)
            .toEqual(expected);
    });
    it(`should parse version with no package id`, async () => {
        // Arrange
        const input = "10.20.343-123123123.abc123.nupkg", expected = {
            id: "",
            version: new Version({
                major: 10,
                minor: 20,
                patch: 343,
                tag: "123123123.abc123"
            })
        };
        // Act
        const result = parseNugetVersion(input);
        // Assert
        expect(result)
            .toEqual(expected);
        expect(result.version.isPreRelease)
            .toBeTrue();
        expect(result.isPreRelease)
            .toBeTrue();
    });
    it(`should parse package id with periods and numbers`, async () => {
        // Arrange
        const input = "package0.Id.10.20.343-123123123.abc123.nupkg", expected = {
            id: "package0.Id",
            version: new Version({
                major: 10,
                minor: 20,
                patch: 343,
                tag: "123123123.abc123"
            })
        };
        // Act
        const result = parseNugetVersion(input);
        // Assert
        expect(result)
            .toEqual(expected);
    });
    it(`should parse package id with periods and numbers (2)`, async () => {
        // Arrange
        const input = "package0.Id33.10.20.343-123123123.abc123.nupkg", expected = {
            id: "package0.Id33",
            version: new Version({
                major: 10,
                minor: 20,
                patch: 343,
                tag: "123123123.abc123"
            })
        };
        // Act
        const result = parseNugetVersion(input);
        // Assert
        expect(result)
            .toEqual(expected);
    });
    it(`should reproduce the full version when running .toString on .version`, async () => {
        // Arrange
        const input = "packageId.1.2.3-123123123.abc123.nupkg", expected = "1.2.3-123123123.abc123";
        // Act
        const result = parseNugetVersion(input);
        // Assert
        expect(result.version.toString())
            .toEqual(expected);
    });
});
