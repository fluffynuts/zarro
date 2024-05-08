"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const faker_1 = require("@faker-js/faker");
describe(`dotnet-cli:listProjects`, () => {
    const { create, listProjects, addProjectToSolution } = requireModule("dotnet-cli");
    it(`should list all projects in the solution`, async () => {
        // Arrange
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), project1Name = `test-project-${faker_1.faker.string.alphanumeric({ length: 10 })}`, project2Name = `test-project-${faker_1.faker.string.alphanumeric({ length: 11 })}`, project3Name = `test-project-${faker_1.faker.string.alphanumeric({ length: 12 })}`, solutionName = `test-sln-${faker_1.faker.string.alphanumeric({ length: 13 })}`;
        const project1 = await create({
            template: "classlib",
            name: project1Name,
            cwd: sandbox.path
        });
        const project2 = await create({
            template: "classlib",
            name: project2Name,
            cwd: sandbox.path
        });
        const project3 = await create({
            template: "classlib",
            name: project3Name,
            cwd: sandbox.path
        });
        const sln = await create({
            template: "sln",
            name: solutionName,
            cwd: sandbox.path
        });
        expect(project1)
            .toBeFile();
        expect(project2)
            .toBeFile();
        expect(project3)
            .toBeFile();
        await addProjectToSolution({
            projectFile: project1,
            solutionFile: sln
        });
        await addProjectToSolution({
            projectFile: project2,
            solutionFile: sln
        });
        // Act
        const result = await listProjects(sln);
        // Assert
        expect(result)
            .toBeEquivalentTo([project1, project2]);
    });
});
