"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const faker_1 = require("@faker-js/faker");
describe(`dotnet-cli:upgradePackages`, () => {
    const { create, installPackage, listPackages, upgradePackages, addProjectToSolution } = requireModule("dotnet-cli");
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
            packages: ["NExpect"],
            showProgress: false
        });
        // Assert
        const currentlyInstalled = await listPackages(projectFile), nexpect = currentlyInstalled.find(o => o.id.toLowerCase() === "nexpect");
        expect(nexpect)
            .toExist();
        const version = new Version(`${nexpect === null || nexpect === void 0 ? void 0 : nexpect.version}`);
        expect(version.isGreaterThan("2.0.1"))
            .toBeTrue();
    });
    it(`should upgrade the single named package in the solution`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), slnName = faker_1.faker.string.alphanumeric({ length: 10 }), project1Name = faker_1.faker.string.alphanumeric({ length: 12 }), project2Name = faker_1.faker.string.alphanumeric({ length: 13 });
        const project1File = await create({
            template: "classlib",
            name: project1Name,
            cwd: sandbox.path
        });
        const project2File = await create({
            template: "classlib",
            name: project2Name,
            cwd: sandbox.path
        });
        await installPackage({
            cwd: sandbox.path,
            projectFile: project1File,
            id: "NExpect",
            version: "2.0.1"
        });
        await installPackage({
            cwd: sandbox.path,
            projectFile: project2File,
            id: "NExpect",
            version: "2.0.1"
        });
        const solutionFile = await create({
            template: "sln",
            name: slnName,
            cwd: sandbox.path
        });
        await addProjectToSolution({
            projectFile: project1File,
            solutionFile
        });
        await addProjectToSolution({
            projectFile: project2File,
            solutionFile
        });
        const installed1 = await listPackages(project1File), originalNExpect1 = installed1.find(o => o.id.toLowerCase() === "nexpect"), installed2 = await listPackages(project2File), originalNExpect2 = installed2.find(o => o.id.toLowerCase() === "nexpect");
        expect(originalNExpect1)
            .toExist();
        expect(originalNExpect1 === null || originalNExpect1 === void 0 ? void 0 : originalNExpect1.version)
            .toEqual("2.0.1");
        expect(originalNExpect2)
            .toExist();
        expect(originalNExpect2 === null || originalNExpect2 === void 0 ? void 0 : originalNExpect2.version)
            .toEqual("2.0.1");
        // Act
        await upgradePackages({
            pathToProjectOrSolution: solutionFile,
            packages: ["NExpect"],
            showProgress: false
        });
        // Assert
        const currentlyInstalled1 = await listPackages(project1File), nexpect1 = currentlyInstalled1.find(o => o.id.toLowerCase() === "nexpect"), currentlyInstalled2 = await listPackages(project1File), nexpect2 = currentlyInstalled2.find(o => o.id.toLowerCase() === "nexpect");
        expect(nexpect1)
            .toExist();
        const version1 = new Version(`${nexpect1 === null || nexpect1 === void 0 ? void 0 : nexpect1.version}`);
        expect(version1.isGreaterThan("2.0.1"))
            .toBeTrue();
        expect(nexpect2)
            .toExist();
        const version2 = new Version(`${nexpect2 === null || nexpect2 === void 0 ? void 0 : nexpect2.version}`);
        expect(version2.isGreaterThan("2.0.1"))
            .toBeTrue();
    });
    it(`should only upgrade the matching package(s) [1: package specified as regex]`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), pbVersion = "3.0.100", nexpectVersion = "2.0.69", projectName = faker_1.faker.string.alphanumeric();
        const projectPath = await create({
            template: "classlib",
            name: projectName,
            cwd: sandbox.path
        });
        await installPackage({
            cwd: sandbox.path,
            projectFile: projectPath,
            id: "PeanutButter.Utils",
            version: pbVersion
        });
        await installPackage({
            cwd: sandbox.path,
            projectFile: projectPath,
            id: "NExpect",
            version: nexpectVersion
        });
        // Act
        await upgradePackages({
            showProgress: false,
            packages: [/nexpect/i],
            preRelease: false,
            pathToProjectOrSolution: projectPath
        });
        // Assert
        const result = await listPackages(projectPath);
        for (const pkg of result) {
            if (pkg.id.toLowerCase() === "nexpect") {
                const ver = new Version(pkg.version);
                expect(ver.isGreaterThan(nexpectVersion))
                    .toBeTrue();
                continue;
            }
            if (pkg.id.toLowerCase() === "peanutbutter.utils") {
                expect(pkg.version)
                    .toEqual(pbVersion);
            }
        }
    });
    it(`should only upgrade the matching package(s) [2: package specified exactly]`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), pbVersion = "3.0.100", nexpectVersion = "2.0.69", projectName = faker_1.faker.string.alphanumeric();
        const projectPath = await create({
            template: "classlib",
            name: projectName,
            cwd: sandbox.path
        });
        await installPackage({
            cwd: sandbox.path,
            projectFile: projectPath,
            id: "PeanutButter.Utils",
            version: pbVersion
        });
        await installPackage({
            cwd: sandbox.path,
            projectFile: projectPath,
            id: "NExpect",
            version: nexpectVersion
        });
        // Act
        await upgradePackages({
            showProgress: false,
            packages: ["nexpect"],
            preRelease: false,
            pathToProjectOrSolution: projectPath
        });
        // Assert
        const result = await listPackages(projectPath);
        for (const pkg of result) {
            if (pkg.id.toLowerCase() === "nexpect") {
                const ver = new Version(pkg.version);
                expect(ver.isGreaterThan(nexpectVersion))
                    .toBeTrue();
                continue;
            }
            if (pkg.id.toLowerCase() === "peanutbutter.utils") {
                expect(pkg.version)
                    .toEqual(pbVersion);
            }
        }
    });
});
