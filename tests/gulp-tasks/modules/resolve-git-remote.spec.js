"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const resolveGitRemote = requireModule("resolve-git-remote");
describe(`resolve-git-remote`, () => {
    it(`should export a function`, async () => {
        // Arrange
        // Act
        expect(resolveGitRemote)
            .toBeFunction();
        // Assert
    });
    it(`should return the remote when there is one`, async () => {
        // Arrange
        // Act
        const zarroRemote = await resolveGitRemote();
        // Assert
        expect(zarroRemote)
            .toEqual("origin");
    });
    it(`should return undefined when there is no remote`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        // Act
        const result = await resolveGitRemote(sandbox.path.toString());
        // Assert
        expect(result)
            .toBeUndefined();
    });
    afterAll(async () => {
        await filesystem_sandbox_1.Sandbox.destroyAll();
    });
});
