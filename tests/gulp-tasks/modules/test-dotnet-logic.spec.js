"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const yafs_1 = require("yafs");
describe(`test-dotnet-logic`, () => {
    const system = requireModule("system");
    describe(`testOneDotNetCoreProject`, () => {
        const { testOneDotNetCoreProject } = requireModule("test-dotnet-logic");
        it(`should test the project`, async () => {
            // Arrange
            spyOn(console, "log");
            const 
            // sandbox = await createRepoSandbox(),
            project = await findProject("C:\\code\\opensource\\NExpect", "NExpect.Matchers.NSubstitute.Tests"), testResults = {
                quackersEnabled: true,
                failed: 0,
                skipped: 0,
                failureSummary: [],
                started: 0,
                passed: 0
            };
            // Act
            const result = await testOneDotNetCoreProject(project, "Debug", "normal", testResults, true, true, true);
            // Assert
            console.log(result);
            expect(result.exitCode)
                .toEqual(0);
        }, 300000);
    });
    async function findProject(basedir, name) {
        const matches = await (0, yafs_1.ls)(basedir, {
            entities: yafs_1.FsEntities.files,
            recurse: true,
            match: new RegExp(`${name}\\.csproj$`),
            fullPaths: true
        });
        const result = matches[0];
        if (!result) {
            throw new Error(`Can't find project: '${name}' under '${basedir}'`);
        }
        return matches[0];
    }
    afterAll(async () => {
        // await Sandbox.destroyAll();
    });
    async function createRepoSandbox() {
        const sandbox = await filesystem_sandbox_1.Sandbox.create();
        await sandbox.run(() => system("git clone https://github.com/fluffynuts/NExpect .", [], {
            suppressOutput: true
        }));
        await sandbox.run(() => system("git submodule update --init", [], { suppressOutput: true }));
        return sandbox;
    }
});
