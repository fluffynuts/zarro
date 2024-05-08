"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const faker_1 = require("@faker-js/faker");
describe(`dotnet-cli:upgradePackages`, () => {
    const { create, installPackage, listPackages, upgradePackages } = requireModule("dotnet-cli");
    const Version = requireModule("version");
    it(`should upgrade the single named package`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), projectName = faker_1.faker.string.alphanumeric({ length: 12 });
        const projectFile = await create({
            template: "classlib",
            name: projectName,
            cwd: sandbox.path
        });
        await installPackage({
            cwd: sandbox.path,
            projectFile,
            id: "NExpect",
            version: "2.0.1"
        });
        const installed = await listPackages(projectFile), originalNExpect = installed.find(o => o.id.toLowerCase() === "nexpect");
        expect(originalNExpect)
            .toExist();
        expect(originalNExpect === null || originalNExpect === void 0 ? void 0 : originalNExpect.version)
            .toEqual("2.0.1");
        // Act
        await upgradePackages({
            pathToProjectOrSolution: projectFile,
            packages: ["NExpect"]
        });
        // Assert
        const currentlyInstalled = await listPackages(projectFile), nexpect = currentlyInstalled.find(o => o.id.toLowerCase() === "nexpect");
        expect(nexpect)
            .toExist();
        const version = new Version(`${nexpect === null || nexpect === void 0 ? void 0 : nexpect.version}`);
        expect(version.isGreaterThan("2.0.1"))
            .toBeTrue();
    });
});
