"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
describe(`test-util-finder`, () => {
    describe(`compareVersionArrays`, () => {
        const { compareVersionArrays } = requireModule("test-util-finder");
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
    describe(`findTool`, () => {
        const { findTool } = requireModule("test-util-finder");
        const which = requireModule("which");
        it(`should return undefined when not found at all`, async () => {
            // Arrange
            const sandbox = await filesystem_sandbox_1.Sandbox.create();
            // Act
            const result = findTool("foo.exe", sandbox.path);
            // Assert
            expect(result)
                .toBeUndefined();
        });
        it(`should return the tool in the path when only found in path`, async () => {
            // Arrange
            const sandbox = await filesystem_sandbox_1.Sandbox.create(), expected = which("git");
            // Act
            const result = findTool("git", sandbox.path);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should return the full path to the found tool`, async () => {
            // Arrange
            const { copyFile } = require("yafs"), path = require("path"), sandbox = await filesystem_sandbox_1.Sandbox.create(), original = which("git");
            if (!original) {
                console.warn("this test requires git to be in the path");
                return;
            }
            await copyFile(original, sandbox.path);
            // Act
            const result = findTool("git", sandbox.path);
            // Assert
            expect(result)
                .toEqual(sandbox.fullPathFor(path.basename(original)));
        });
    });
});
