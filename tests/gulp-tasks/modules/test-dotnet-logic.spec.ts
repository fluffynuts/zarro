import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { FsEntities, ls } from "yafs";

describe(`test-dotnet-logic`, () => {
    const system = requireModule<System>("system");

    describe(`testOneDotNetCoreProject`, () => {
        const { testOneDotNetCoreProject } = requireModule<TestDotNetLogic>("test-dotnet-logic");
        it(`should test the project`, async () => {
            // Arrange
            spyOn(console, "log");
            const
                sandbox = await createRepoSandbox(),
                project = await findProject(sandbox.path, "NExpect.Matchers.NSubstitute.Tests"),
                testResults = {
                    quackersEnabled: true,
                    failed: 0,
                    skipped: 0,
                    failureSummary: [],
                    started: 0,
                    passed: 0
                } satisfies TestResults;
            // Act
            const result = await testOneDotNetCoreProject(
                project,
                "Debug",
                "normal",
                testResults,
                true,
                true,
                true
            );
            // Assert
            console.log(result);
            expect(result.exitCode)
                .toEqual(0);
        }, 300000);
    });

    async function findProject(
        basedir: string,
        name: string
    ): Promise<string> {
        const matches = await ls(
            basedir, {
                entities: FsEntities.files,
                recurse: true,
                match: new RegExp(`${name}\\.csproj$`),
                fullPaths: true
            }
        );
        const result = matches[0];
        if (!result) {
            throw new Error(`Can't find project: '${ name }' under '${ basedir }'`);
        }
        return matches[0];
    }

    afterAll(async () => {
        // await Sandbox.destroyAll();
    });

    async function createRepoSandbox(): Promise<Sandbox> {
        const
            sandbox = await Sandbox.create();
        await sandbox.run(
            () => system(
                "git clone https://github.com/fluffynuts/NExpect .",
                [], {
                    suppressOutput: true
                }
            )
        );
        await sandbox.run(
            () => system("git submodule update --init", [], { suppressOutput: true })
        );
        return sandbox;
    }
});
