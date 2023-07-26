"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const yafs_1 = require("yafs");
describe(`fetch-github-release`, function () {
    const { fetchLatestRelease } = requireModule("fetch-github-release");
    it(`should export fetchLatestRelease function`, async () => {
        // Arrange
        // Act
        expect(fetchLatestRelease)
            .toBeFunction();
        // Assert
    });
    it(`should fetch a release`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        // Act
        await fetchLatestRelease({
            owner: "axllent",
            repo: "mailpit",
            destination: sandbox.path
        });
        // Assert
        const contents = await (0, yafs_1.ls)(sandbox.path), lowercased = contents.map(s => s.toLowerCase());
        const mailpit = lowercased.find(o => o === "mailpit") ||
            lowercased.find(o => o === "mailpit.exe");
        expect(mailpit)
            .toBeDefined();
    }, 30000);
});
