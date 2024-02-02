"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const resolveGitBranch = requireModule("resolve-git-branch");
const yafs_1 = require("yafs");
describe(`resolve-git-branch`, () => {
    const system = requireModule("system");
    it(`should export a function`, async () => {
        // Arrange
        // Act
        expect(resolveGitBranch)
            .toBeFunction();
        // Assert
    });
    it(`should return the branch`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        await sandbox.run(async () => {
            await system("git init");
            await (0, yafs_1.writeTextFile)("foo", "bar");
            await system("git add -A :/");
            await system("git commit -m \"test\"");
        });
        // Act
        const zarroBranch = await sandbox.run(() => resolveGitBranch());
        // Assert
        expect(zarroBranch)
            .toEqual("master");
    });
    it(`should return undefined when there is no git repo`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        // Act
        const result = await resolveGitBranch(sandbox.path);
        // Assert
        expect(result)
            .toBeUndefined();
    });
    afterAll(async () => {
        await filesystem_sandbox_1.Sandbox.destroyAll();
    });
});
