"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const yafs_1 = require("yafs");
describe(`gulp-version`, () => {
    it(`should return the currently-installed version`, async () => {
        // Arrange
        const raw = await (0, yafs_1.readTextFile)("node_modules/gulp/package.json"), parsed = JSON.parse(raw), expected = parsed.version;
        // Act
        const result = requireModule("gulp-version");
        // Assert
        expect(`${result.major}.${result.minor}.${result.patch}`)
            .toEqual(expected);
    });
});
