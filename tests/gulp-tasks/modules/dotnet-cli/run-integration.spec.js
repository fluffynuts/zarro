"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const yafs_1 = require("yafs");
const faker_1 = require("@faker-js/faker");
const realSystem = requireModule("system"), { run, create } = requireModule("dotnet-cli");
describe(`dotnet-cli:run`, () => {
    describe(`integration testing`, () => {
        afterEach(() => {
            jest.resetAllMocks();
            filesystem_sandbox_1.Sandbox.destroyAll();
        });
        it(`should run the project`, async () => {
            // Arrange
            const sandbox = await filesystem_sandbox_1.Sandbox.create();
            await create({
                cwd: sandbox.path,
                name: "hello-world",
                template: "console"
            });
            const allFiles = await (0, yafs_1.ls)(sandbox.path, {
                recurse: true,
                entities: yafs_1.FsEntities.files,
                fullPaths: true
            });
            const target = allFiles.find(s => s.match(/\.csproj$/));
            if (!target) {
                throw new Error(`Can't find hello-world project in ${sandbox.path}`);
            }
            const program = allFiles.find(s => s.match(/program.cs$/i));
            if (!program) {
                throw new Error(`Can't find project.cs in ${sandbox.path}`);
            }
            const original = await (0, yafs_1.readTextFile)(program), updated = `
 ${original}
 foreach (var arg in args)
 {
     Console.WriteLine(arg);
 }
 `;
            await (0, yafs_1.writeTextFile)(program, updated);
            const args = [faker_1.faker.string.alphanumeric()];
            // Act
            const result = await run({
                target,
                args
            });
            // Assert
            expect(realSystem.isError(result))
                .toBeFalse();
            expect(result.stdout[0])
                .toEqual("Hello, World!");
            expect(result.stdout[1])
                .toEqual(args[0]);
        });
    });
});
