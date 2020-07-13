"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const run_in_folder_1 = require("../../test-helpers/run-in-folder");
describe(`find-git-commit-delta-count`, () => {
    const exec = requireModule("exec"), sut = requireModule("fetch-git-commit-delta-count");
    it(`should return 0-0 for same branch`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        await initGit(sandbox.path);
        await sandbox.writeFile("README.md", "test");
        await commitAll(sandbox.path, ":tada: initial commit");
        // Act
        const result = await run_in_folder_1.runInFolder(sandbox.path, () => sut("master", "master"));
        // Assert
        expect(result)
            .toEqual({ behind: 0, ahead: 0 });
    });
    it(`should return 0-1 for a branch off of master with one extra commit`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        await initGit(sandbox.path);
        await sandbox.writeFile("README.md", "test");
        await commitAll(sandbox.path, ":tada: initial commit");
        await git("checkout", "-b", "some-branch");
        await sandbox.writeFile("README.md", "test\nnew stuff");
        await commitAll(sandbox.path, ":memo: add moar dox");
        // Act
        const result = await run_in_folder_1.runInFolder(sandbox.path, () => sut("master", "master"));
        // Assert
        expect(result)
            .toEqual({ behind: 0, ahead: 1 });
    });
    async function commitAll(at, message) {
        await run_in_folder_1.runInFolder(at, async () => {
            await git("add", "-A", ":/");
            await git("commit", "-m", `"${message}"`);
        });
    }
    async function initGit(at) {
        await run_in_folder_1.runInFolder(at, () => git("init"));
    }
    async function git(...args) {
        return exec("git", args);
    }
});
