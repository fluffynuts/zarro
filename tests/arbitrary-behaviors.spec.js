"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const spy_on_console_1 = require("./test-helpers/spy-on-console");
describe(`behaviors`, () => {
    (0, spy_on_console_1.spyOnConsole)();
    const system = requireModule("system");
    describe(`npm scripts vs missing tasks`, () => {
        it(`should error when the npm script refers to a non-existent task`, async () => {
            // Arrange
            // Act
            await expect(system("npm run missing", [], { suppressOutput: true })).rejects.toThrow();
            // Assert
        });
        it(`should not error when the task exists with the same name as the script`, async () => {
            // Arrange
            // Act
            await expect(system("npm run empty", [], { suppressOutput: true })).resolves.not.toThrow();
            // Assert
        });
    });
});
