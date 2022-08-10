"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const fs_1 = require("fs");
describe('read-package-json', function () {
    const { promises } = require("fs"), fs = promises, readPackageJson = require("../../../gulp-tasks/modules/read-package-json"), path = require("path");
    it(`should read the package.json at the current dir by default`, async () => {
        // Arrange
        const expected = JSON.parse(await fs.readFile("package.json", { encoding: "utf8" }));
        // Act
        const result = await readPackageJson();
        // Assert
        expect(result)
            .toEqual(expected);
    });
    it(`should read the package.json in the provided dir`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), dir = "__here__", fullDirPath = sandbox.fullPathFor(dir);
        await sandbox.mkdir(dir);
        (0, fs_1.copyFileSync)(path.resolve("gulp-tasks/start/_package.json"), sandbox.fullPathFor(`${dir}/package.json`));
        const expected = JSON.parse(await fs.readFile(path.join(fullDirPath, "package.json")));
        // Act
        const result = await readPackageJson(fullDirPath);
        // Assert
        expect(result)
            .toEqual(expected);
    });
    it(`should read the package.json at the provided file path`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), dir = "__here__", fullDirPath = sandbox.fullPathFor(dir);
        await sandbox.mkdir(dir);
        (0, fs_1.copyFileSync)(path.resolve("gulp-tasks/start/_package.json"), sandbox.fullPathFor(`${dir}/package.json`));
        const expected = JSON.parse(await fs.readFile(path.join(fullDirPath, "package.json")));
        // Act
        const result = await readPackageJson(path.join(fullDirPath, "package.json"));
        // Assert
        expect(result)
            .toEqual(expected);
    });
    afterAll(async () => {
        await filesystem_sandbox_1.Sandbox.destroyAll();
    });
});
