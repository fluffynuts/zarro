"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const faker_1 = require("@faker-js/faker");
const path_1 = __importDefault(require("path"));
describe(`dotnet-cli:create`, () => {
    const { create } = requireModule("dotnet-cli");
    it(`should be a function`, async () => {
        // Arrange
        // Act
        expect(create)
            .toBeFunction();
        // Assert
    });
    afterAll(async () => await filesystem_sandbox_1.Sandbox.destroyAll());
    it(`should be able to create a new project`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), project = `test-project-${faker_1.faker.word.sample(2).replace(/\s+/g, "-")}`;
        // Act
        const result = await create({
            template: "classlib",
            name: project,
            cwd: sandbox.path
        });
        // Assert
        expect(result)
            .toBeFile();
        expect(result)
            .toStartWith(sandbox.path);
        expect(result)
            .toEndWith(".csproj");
        const parts = result.split(/[\\/]/g), projectFile = parts[parts.length - 1], projectDir = parts[parts.length - 2], remainder = parts.slice(0, parts.length - 2), basePath = remainder.join(path_1.default.sep);
        debugger;
        expect(basePath)
            .toEqual(sandbox.path);
        expect(projectFile)
            .toEqual(`${project}.csproj`);
        expect(projectDir)
            .toEqual(project);
    });
    it(`should be able to create a new solution`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), solution = `test-sln-${faker_1.faker.word.sample(2).replace(/\s+/g, "-")}`, expected = sandbox.fullPathFor(`${solution}.sln`);
        // Act
        const result = await create({
            template: "sln",
            name: solution,
            cwd: sandbox.path
        });
        // Assert
        expect(result)
            .toEqual(expected);
        expect(result)
            .toBeFile();
    });
});
