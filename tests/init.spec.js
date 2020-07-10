"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const sut = require("../index-modules/handlers/init");
describe(`init`, () => {
    describe(`test function`, () => {
        describe(`when args contains --init`, () => {
            it(`should return true`, async () => {
                // Arrange
                const args = ["--init"];
                // Act
                const result = sut.test(args);
                // Assert
                expect(result).toBeTrue();
            });
        });
        describe(`otherwise`, () => {
            it(`should return false`, async () => {
                // Arrange
                const args = ["build"];
                // Act
                const result = sut.test(args);
                // Assert
                expect(result).toBeFalse();
            });
        });
    });
    describe(`handler`, () => {
        afterAll(async () => {
            await filesystem_sandbox_1.Sandbox.destroyAll();
        });
        describe(`when zarro script is missing`, () => {
            it(`should add the zarro script`, async () => {
                // Arrange
                spyOn(console, "log");
                const sandbox = await filesystem_sandbox_1.Sandbox.create();
                const pkg = {};
                await sandbox.writeFile("package.json", JSON.stringify(pkg));
                // Act
                await sut.handler(sandbox.fullPathFor("package.json"));
                // Assert
                const contents = await sandbox.readTextFile("package.json");
                console.log(contents);
                const newPkg = JSON.parse(contents);
                expect(newPkg.scripts).toBeDefined();
                expect(newPkg.scripts["zarro"]).toEqual("zarro");
                expect(console.log).toHaveBeenCalledWith("run zarro with 'npm run zarro -- {tasks or gulp arguments}')");
                expect(console.log).toHaveBeenCalledWith("eg: 'npm run zarro -- build' to attempt .net project build");
                expect(console.log).toHaveBeenCalledWith("get more help with 'npm run zarro -- --help'");
            });
        });
    });
});
