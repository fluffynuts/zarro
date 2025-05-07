"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const yafs_1 = require("yafs");
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
            // Act
            const result = await run({
                target
            });
            // Assert
            expect(realSystem.isError(result))
                .toBeFalse();
            expect(result.stdout[0])
                .toEqual("Hello, World!");
        });
    });
});
