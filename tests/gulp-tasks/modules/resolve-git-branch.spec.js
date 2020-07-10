"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const resolveGitBranch = requireModule("resolve-git-branch");
describe(`resolve-git-branch`, () => {
    it(`should export a function`, async () => {
        // Arrange
        // Act
        expect(resolveGitBranch)
            .toBeFunction();
        // Assert
    });
    it(`should return the remote when there is one`, async () => {
        // Arrange
        // Act
        const zarroBranch = await resolveGitBranch();
        // Assert
        expect(zarroBranch)
            .toEqual("master");
    });
    it(`should return undefined when there is no remote`, async () => {
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
