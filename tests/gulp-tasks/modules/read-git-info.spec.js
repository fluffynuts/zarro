"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const path_1 = __importDefault(require("path"));
const run_in_folder_1 = require("../../test-helpers/run-in-folder");
const readGitInfo = requireModule("read-git-info"), exec = requireModule("exec"), writeTextFile = requireModule("write-text-file"), readTextFile = requireModule("read-text-file");
describe(`read-git-info`, () => {
    it(`should export a function`, async () => {
        // Arrange
        // Act
        expect(readGitInfo)
            .toBeFunction();
        // Assert
    });
    describe(`when working with git repo`, () => {
        it(`should return git info`, async () => {
            // Arrange
            const sandbox = await filesystem_sandbox_1.Sandbox.create();
            await createRepo(sandbox.path);
            await addRemote(sandbox.path, "origin", "https://github.com/user/repo");
            await commitFile(sandbox.path, "README.md", "this is a test");
            await addBranch(sandbox.path, "branch1");
            await addBranch(sandbox.path, "branch2");
            await checkout(sandbox.path, "master");
            // Act
            const result = await readGitInfo(sandbox.path);
            // Assert
            expect(result.isGitRepository)
                .toBeTrue();
            expect(result.branches)
                .toBeArray();
            expect(result.branches.sort())
                .toEqual(["branch1", "branch2", "master"]);
            expect(result.currentBranch)
                .toEqual("master");
        });
    });
    describe(`when working in !repo`, () => {
        it(`should return info for !repo`, async () => {
            // Arrange
            const sandbox = await filesystem_sandbox_1.Sandbox.create();
            // Act
            const result = await readGitInfo(sandbox.path);
            // Assert
            expect(result)
                .toExist();
            expect(result.isGitRepository)
                .toBeFalse();
            expect(result.primaryRemote)
                .toBeUndefined();
            expect(result.currentBranch)
                .toBeUndefined();
            expect(result.remotes)
                .toBeEmptyArray();
            expect(result.branches)
                .toBeEmptyArray();
        });
    });
    describe(`when working in git repo with no remote`, () => {
        describe(`when no commits`, () => {
            it(`should return git info with no branch`, async () => {
                // Arrange
                const sandbox = await filesystem_sandbox_1.Sandbox.create();
                await createRepo(sandbox.path);
                // Act
                const result = await readGitInfo(sandbox.path);
                // Assert
                expect(result)
                    .toExist();
                expect(result.isGitRepository)
                    .toBeTrue();
                expect(result.primaryRemote)
                    .toBeUndefined();
                expect(result.currentBranch)
                    .toBeUndefined();
                expect(result.remotes)
                    .toBeEmptyArray();
                expect(result.branches)
                    .toBeEmptyArray();
            });
        });
        describe(`when have single commit`, () => {
            it(`should return git info with branch`, async () => {
                // Arrange
                const sandbox = await filesystem_sandbox_1.Sandbox.create();
                await createRepo(sandbox.path);
                await commitFile(sandbox.path, "README.md", "test");
                // Act
                const result = await readGitInfo(sandbox.path);
                // Assert
                expect(result)
                    .toExist();
                expect(result.isGitRepository)
                    .toBeTrue();
                expect(result.primaryRemote)
                    .toBeUndefined();
                expect(result.currentBranch)
                    .toEqual("master");
                expect(result.remotes)
                    .toBeEmptyArray();
                expect(result.branches)
                    .toEqual(["master"]);
            });
        });
    });
    beforeEach(() => {
        jest.setTimeout(10000); // fs-ops may take a while ?
        exec.alwaysSuppressOutput = true;
    });
    afterAll(async () => await filesystem_sandbox_1.Sandbox.destroyAll());
    async function createRepo(at) {
        return run_in_folder_1.runInFolder(at, () => exec("git", ["init"]));
    }
    async function addRemote(at, name, url) {
        return run_in_folder_1.runInFolder(at, () => exec("git", ["remote", "add", name, url]));
    }
    async function commitFile(at, name, contents) {
        return run_in_folder_1.runInFolder(at, async () => {
            const fpath = path_1.default.join(at, name);
            if (typeof contents === "function") {
                const current = await readTextFile(fpath);
                const updated = contents(current);
                await writeTextFile(fpath, updated);
            }
            else {
                await writeTextFile(fpath, contents);
            }
            await commitAll(at, `test commit ${Date.now()}`);
        });
    }
    async function commitAll(at, message) {
        return run_in_folder_1.runInFolder(at, async () => {
            await exec("git", ["add", "-A", ":/"]);
            await exec("git", ["commit", "-am", `"${message}"`]);
        });
    }
    async function checkout(at, branch, create) {
        create = create !== null && create !== void 0 ? create : false;
        const args = [
            "checkout"
        ];
        if (create) {
            args.push("-b");
        }
        args.push(branch);
        return run_in_folder_1.runInFolder(at, () => exec("git", args));
    }
    async function addBranch(at, name) {
        // checkout -b
        await checkout(at, name, true);
        // modify readme
        await commitFile(at, "README.md", contents => contents + `\nmodified for: ${name} at ${new Date()}`);
        // commit
    }
});
