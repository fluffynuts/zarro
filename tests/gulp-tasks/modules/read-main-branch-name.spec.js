"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filesystem_sandbox_1 = require("filesystem-sandbox");
describe(`read-main-branch-name`, () => {
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
        jest.setTimeout(150000);
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        await sandbox.writeFile("README.md", "test");
        await sandbox.run(async () => {
            await exec("git", "init");
            await exec("git", "add", "-A", ":/");
            await exec("git", "commit", "-m", `"initial commit"`);
        });
        // Act
        const result = await sandbox.run(() => sut());
        // Assert
        expect(result)
            .toEqual("master");
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
        // Act
        const result = await sandbox.run(() => sut());
        // Assert
        expect(result)
            .toEqual("master");
    });
});
