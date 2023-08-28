"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const gulpCliMock = jest.fn();
jest.mock("gulp-cli", () => gulpCliMock);
describe(`invoke-gulp`, () => {
    const path = require("path"), isFile = require("../index-modules/is-file"), sut = require("../index-modules/handlers/invoke-gulp");
    describe(`test fn`, () => {
        it(`should always return true (should be final queried)`, async () => {
            // Arrange
            // Act
            expect(sut.test([1, 1, 3])).toBeTrue();
            // Assert
        });
    });
    function findStarterGulpFile() {
        return path.join(path.dirname(__dirname), "gulp-tasks", "start", "gulpfile.js");
    }
    describe(`handler`, () => {
        describe(`when NO_COLOR env not set`, () => {
            it(`should invoke gulp with all the args`, async () => {
                // Arrange
                spyOn(console, "error");
                const args = ["build", "test"], gulpFile = findStarterGulpFile(), expected = ["--color", "--gulpfile", gulpFile, "--cwd", process.cwd()].concat(args);
                // Act
                await sut.handler(args);
                // Assert
                expect(gulpCliMock)
                    .toHaveBeenCalledTimes(1);
                expect(process.argv.slice(2))
                    .toEqual(expected);
            });
        });
        describe(`when NO_COLOR env set`, () => {
            it(`should invoke gulp with all the args`, async () => {
                // Arrange
                process.env.NO_COLOR = "1";
                const args = ["build", "test"], gulpFile = findStarterGulpFile(), expected = ["--no-color", "--gulpfile", gulpFile, "--cwd", process.cwd()].concat(args);
                // Act
                await sut.handler(args);
                // Assert
                expect(gulpCliMock)
                    .toHaveBeenCalledTimes(1);
                expect(process.argv.slice(2))
                    .toEqual(expected);
            });
        });
        let originalNoColor = "";
        beforeAll(() => {
            originalNoColor = process.env.NO_COLOR;
        });
        afterAll(() => {
            process.env.NO_COLOR = originalNoColor;
        });
        beforeEach(() => {
            process.env.NO_COLOR = undefined;
        });
    });
});
