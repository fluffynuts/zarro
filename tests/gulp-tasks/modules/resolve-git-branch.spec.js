"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const resolveGitBranch = requireModule("resolve-git-branch");
const system_wrapper_1 = require("system-wrapper");
describe(`resolve-git-branch`, () => {
    it(`should export a function`, async () => {
        // Arrange
        // Act
        expect(resolveGitBranch)
            .toBeFunction();
        // Assert
    });
    it(`should return the branch when there is one`, async () => {
        // Arrange
        const sysresult = await (0, system_wrapper_1.system)("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
            suppressOutput: true
        });
        const expected = sysresult.stdout[0];
        expect(expected)
            .toExist();
        expect(expected)
            .not.toBeEmptyString();
        // Act
        const zarroBranch = await resolveGitBranch();
        // Assert
        expect(zarroBranch)
            .toEqual(expected);
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
