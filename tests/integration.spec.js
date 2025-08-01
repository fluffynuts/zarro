"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spy_on_console_1 = require("./test-helpers/spy-on-console");
describe(`integration testing`, () => {
    (0, spy_on_console_1.spyOnConsole)();
    const system = requireModule("system");
    it(`should be able to run with --show-env`, async () => {
        // Arrange
        const args = [
            "index.js",
            "--show-env"
        ], stdoutData = [];
        // Act
        await system("node", args, {
            stdout: (data) => stdoutData.push(data),
            stderr: (data) => {
            }
        });
        // Assert
        expect(stdoutData.join(""))
            .toContain("BUILD_CONFIGURATION");
    });
    it(`should be able to run an npm task as if it were a gulp task`, async () => {
        // Arrange
        const args = [
            "index.js",
            "test-npm-gulp-task"
        ], stdoutData = [];
        // Act
        try {
            await system("node", args, {
                stdout: (data) => stdoutData.push(data.toString()),
                stderr: (data) => {
                }
            });
        }
        catch (e) {
            console.log(e);
            throw e;
        }
        // Assert
        expect(stdoutData.join("\n"))
            .toContain("this is a test");
    });
});
