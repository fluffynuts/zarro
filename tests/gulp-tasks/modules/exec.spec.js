"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec = require("../../../gulp-tasks/modules/exec");
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const dist_1 = require("debugger-is-attached/dist");
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
                spyOn(console, "error");
                const sandbox = await filesystem_sandbox_1.Sandbox.create(), code = "console.log('hello');";
                await sandbox.writeFile("index.js", code);
                // Act
                const result = await exec("node", [sandbox.fullPathFor("index.js")]);
                // Assert
                expect((result || "").trim())
                    .toEqual("hello");
            });
        });
        describe(`when command fails`, () => {
            it(`should reject with error info`, async () => {
                // Arrange
                spyOn(console, "log");
                spyOn(console, "error");
                const sandbox = await filesystem_sandbox_1.Sandbox.create(), code = "console.log('whoopsie!'); throw new Error('the message');";
                await sandbox.writeFile("index.js", code);
                // Act
                try {
                    await exec("node", [sandbox.fullPathFor("index.js")]);
                }
                catch (e) {
                    const err = e;
                    console.log({
                        e
                    });
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
        describe(`when command times out`, () => {
            it(`should reject with timeout`, async () => {
                // Arrange
                spyOn(console, "log");
                spyOn(console, "error");
                const sandbox = await filesystem_sandbox_1.Sandbox.create(), code = "setTimeout(() => { console.log('time to die'); process.exit(0) }, 2000);";
                await sandbox.writeFile("index.js", code);
                // Act
                const start = Date.now();
                try {
                    await exec("node", [
                        sandbox.fullPathFor("index.js")
                    ], {
                        timeout: 100,
                        suppressOutput: true,
                        killSignal: "SIGKILL"
                    });
                }
                catch (e) {
                    const end = Date.now();
                    // prove that the exec finished early
                    expect(end - start)
                        .toBeLessThan(1000);
                    const err = e;
                    expect(err.info.timedOut)
                        .toBeTrue();
                    expect(console.error)
                        .not.toHaveBeenCalled();
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
            expect(result.trim())
                .toEqual(sandbox.path);
        }
        finally {
            process.chdir(start);
        }
        // Assert
    });
    it(`should run the command from the provided working dir`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        // Act
        const result = await exec("pwd", [], { cwd: sandbox.path });
        // Assert
        expect(result.trim())
            .toEqual(sandbox.path);
    });
    afterAll(async () => {
        await filesystem_sandbox_1.Sandbox.destroyAll();
    });
    beforeEach(async () => {
        jest.setTimeout(await (0, dist_1.debuggerIsAttached)()
            ? 300000
            : 5000);
    });
});
