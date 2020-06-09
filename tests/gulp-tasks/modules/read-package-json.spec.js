"use strict";
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
        const dir = path.resolve("gulp-tasks/start"), expected = JSON.parse(await fs.readFile(path.join(dir, "package.json")));
        // Act
        const result = await readPackageJson(dir);
        // Assert
        expect(result)
            .toEqual(expected);
    });
    it(`should read the package.json at the provided file path`, async () => {
        // Arrange
        const dir = path.resolve("gulp-tasks/start"), expected = JSON.parse(await fs.readFile(path.join(dir, "package.json")));
        // Act
        const result = await readPackageJson(path.join(dir, "package.json"));
        // Assert
        expect(result)
            .toEqual(expected);
    });
});
