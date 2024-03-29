"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filesystem_sandbox_1 = require("filesystem-sandbox");
describe(`read-main-branch-name`, () => {
    if (process.env.RUNNING_IN_GITHUB_ACTION) {
        return it.skip(`- tests don't work well @ GH`, () => {
        });
    }
    const exec_ = requireModule("exec"), exec = (cmd, ...args) => exec_(cmd, args, { suppressOutput: true });
    let sut;
    beforeEach(() => {
        try {
            doImport();
        }
        catch (e) {
            // suppress
        }
    });
    function doImport() {
        sut = sut || requireModule("read-main-branch-name");
    }
    it(`should be importable as a zarro module`, async () => {
        // Arrange
        // Act
        expect(() => doImport())
            .not.toThrow();
        // Assert
    });
    it(`should return master for a default init`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        await sandbox.writeFile("README.md", "test");
        await sandbox.run(async () => {
            await exec("git", "init");
            await exec("git", "add", "-A", ":/");
            await exec("git", "commit", "-m", `"initial commit"`);
        });
        spyOn(console, "warn");
        // Act
        const result = await sandbox.run(() => sut());
        // Assert
        expect(result)
            .toEqual("master");
        expect(console.warn)
            .toHaveBeenCalled();
    });
    it(`should return master for a default repo with a remote`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        await sandbox.writeFile("README.md", "test");
        await sandbox.run(async () => {
            await exec("git", "init");
            await exec("git", "add", "-A", ":/");
            await exec("git", "commit", "-m", `"initial commit"`);
            await exec("git", "remote", "add", "origin", "https://github.com/user/repo");
        });
        spyOn(console, "warn");
        // Act
        const result = await sandbox.run(() => sut());
        // Assert
        expect(result)
            .toEqual("master");
        expect(console.warn)
            .toHaveBeenCalled();
    });
});
