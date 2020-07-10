"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec = require("../../../gulp-tasks/modules/exec");
const gutil = require("../../../gulp-tasks/modules/gulp-util");
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
describe(`exec`, () => {
    it(`should be a function`, async () => {
        // Arrange
        // Act
        expect(exec)
            .toBeFunction();
        // Assert
    });
    describe(`default invocation (will use spawn with cmd.exe on windows)`, () => {
        describe(`when command is successful`, () => {
            it(`should return the stdout`, async () => {
                // Arrange
                spyOn(console, "log");
                const sandbox = await filesystem_sandbox_1.Sandbox.create(), code = "console.log('hello');";
                await sandbox.writeFile("index.js", code);
                // Act
                const result = await exec("node", [sandbox.fullPathFor("index.js")]);
                // Assert
                expect((result || "").trim())
                    .toEqual("hello");
                expect(console.log)
                    .toHaveBeenCalledOnceWith(gutil.colors.yellow("hello"));
            });
        });
        describe(`when command fails`, () => {
            it(`should reject with error info`, async () => {
                // Arrange
                spyOn(console, "log");
                const sandbox = await filesystem_sandbox_1.Sandbox.create(), code = "console.log('whoopsie!'); throw new Error('the message');";
                await sandbox.writeFile("index.js", code);
                // Act
                try {
                    await exec("node", [sandbox.fullPathFor("index.js")]);
                }
                catch (e) {
                    const err = e;
                    expect(err.info.exitCode)
                        .toBeGreaterThan(0);
                    expect(err.info.stdout.join("\n"))
                        .toContain("whoopsie!");
                    expect(err.info.stderr.join("\n"))
                        .toContain("the message");
                    return;
                }
                // Assert
                fail("should have caught an error");
            });
        });
    });
    it(`should run the command from the current working directory`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        const start = process.cwd();
        // Act
        try {
            process.chdir(sandbox.path);
            const result = await exec("pwd", [], { suppressOutput: true });
            expect(result)
                .toEqual(sandbox.path);
        }
        finally {
            process.chdir(start);
        }
        // Assert
    });
    afterAll(async () => {
        await filesystem_sandbox_1.Sandbox.destroyAll();
    });
});
