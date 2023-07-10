import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { Sandbox } from "filesystem-sandbox";
import path from "path";

describe("dotnet-cli", () => {
  let allowLogs = false;
  beforeEach(() => {
    allowLogs = false;
    const original = console.log;
    spyOn(console, "log").and.callFake((...args: any[]) => {
      if (!allowLogs) {
        return;
      }
      original.apply(console, args);
    });
  });
  const
    realSpawn = require("../../../gulp-tasks/modules/spawn"),
    spawn = jest.fn().mockImplementation((exe, args, opts) => {
      if (args[0] == "nuget" && args[1] == "list") {
        return realSpawn(exe, args, opts)
      }
      return Promise.resolve({
        executable: exe,
        args,
        exitCode: 0
      } as SpawnResult);
    }),
    requireModuleActual = require("../../../gulp-tasks/modules/require-module");
  requireModuleActual.mock("spawn", spawn);
  (spawn as any).isSpawnError = realSpawn.isSpawnError;
  (spawn as any).isSpawnResult = realSpawn.isSpawnResult;

  const sut = requireModule<DotNetCli>("dotnet-cli");
  const env = requireModule<Env>("env");
  const anything = expect.any(Object);

  describe(`clean`, () => {
    const { clean } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      // Assert
      expect(clean)
        .toBeAsyncFunction();
    });

    it(`should use the provided framework`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        framework = faker.word.sample();
      // Act
      await clean({
        target,
        framework
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "clean", target, "--framework", framework ],
          anything
        );
    });

    it(`should use the provided runtime`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        runtime = faker.word.sample();
      // Act
      await clean({
        target,
        runtime
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "clean", target, "--runtime", runtime ],
          anything
        );
    });

    it(`should use the provided configuration`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        configuration = faker.word.sample();
      // Act
      await clean({
        target,
        configuration
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "clean", target, "--configuration", configuration ],
          anything
        );
    });

    it(`should use the provided configurations`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        configuration1 = faker.word.sample(),
        configuration2 = faker.word.sample();
      // Act
      await clean({
        target,
        configuration: [ configuration1, configuration2 ]
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledTimes(2);
      expect(spawn)
        .toHaveBeenCalledWith(
          "dotnet", [ "clean", target, "--configuration", configuration1 ],
          anything
        );
      expect(spawn)
        .toHaveBeenCalledWith(
          "dotnet", [ "clean", target, "--configuration", configuration2 ],
          anything
        );
    });

    [
      "m", "minimal",
      "q", "quiet",
      "n", "normal",
      "d", "detailed",
      "diag", "diagnostic"
    ].forEach(verbosity => {
      it(`should use the provided verbosity`, async () => {
        // Arrange
        const
          target = faker.word.sample();
        // Act
        await clean({
          target,
          verbosity: verbosity as DotNetVerbosity
        });
        // Assert
        expect(spawn)
          .toHaveBeenCalledOnceWith(
            "dotnet", [ "clean", target, "--verbosity", verbosity ],
            anything
          );
      });
    });

    // shouldn't ever have to do this - dotnet clean should be
    // looking at the csproj, surely?
    it(`should use the provided output`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        output = faker.word.sample();
      // Act
      await clean({
        target,
        output
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "clean", target, "--output", output ],
          anything
        );
    });

  });

  describe(`build`, () => {
    const { build } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(build)
        .toBeAsyncFunction();
      // Assert
    });
    [
      "m", "minimal",
      "q", "quiet",
      "n", "normal",
      "d", "detailed",
      "diag", "diagnostic"
    ].forEach(verbosity => {
      it(`should use the provided verbosity`, async () => {
        // Arrange
        const
          target = faker.word.sample();
        // Act
        await build({
          target,
          verbosity: verbosity as DotNetVerbosity
        });
        // Assert
        expect(spawn)
          .toHaveBeenCalledOnceWith(
            "dotnet", [ "build", target, "--verbosity", verbosity ],
            anything
          );
      });
    });

    it(`should use the provided configuration`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        configuration = faker.word.sample();
      // Act
      await build({
        target,
        configuration: configuration
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--configuration", configuration ],
          anything
        )
    });

    it(`should use the provided framework`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        framework = faker.word.sample();
      // Act
      await build({
        target,
        framework
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--framework", framework ],
          anything
        )
    });

    it(`should use the provided runtime`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        runtime = faker.word.sample();
      // Act
      await build({
        target,
        runtime
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--runtime", runtime ],
          anything
        )
    });

    it(`should use the provided architecture`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        arch = faker.word.sample();
      // Act
      await build({
        target,
        arch
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--arch", arch ],
          anything
        )
    });

    it(`should use the provided os`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        os = faker.word.sample();
      // Act
      await build({
        target,
        os
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--os", os ],
          anything
        )
    });

    it(`should use the provided version suffix`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        versionSuffix = faker.word.sample();
      // Act
      await build({
        target,
        versionSuffix
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--version-suffix", versionSuffix ],
          anything
        )
    });

    it(`should be able to skip package restore`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await build({
        target,
        noRestore: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--no-restore" ],
          anything
        )
    });

    it(`should be able to skip dependencies`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await build({
        target,
        noDependencies: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--no-dependencies" ],
          anything
        )
    });

    it(`should be able to skip incremental building`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await build({
        target,
        noIncremental: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--no-incremental" ],
          anything
        )
    });

    it(`should be able to force disable build servers`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await build({
        target,
        disableBuildServers: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--disable-build-servers" ],
          anything
        )
    });

    it(`should be able to build self-contained`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await build({
        target,
        selfContained: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--self-contained" ],
          anything
        )
    });

    it(`should disable build servers on request`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await build({
        target,
        disableBuildServers: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "--disable-build-servers" ],
          anything
        )
    });

    it(`should add msbuildProperties, when present`, async () => {
      // Arrange
      const target = faker.word.sample();
      // Act
      await build({
        target,
        msbuildProperties: {
          foo: "bar",
          quux: "wibbles and toast",
          "spaced arg": "more spaces"
        }
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "-p:foo=bar", `-p:quux="wibbles and toast"`, `-p:"spaced arg"="more spaces"` ],
          anything
        );
    });

    it(`should add additionalArguments, when set`, async () => {
      // Arrange
      const target = faker.word.sample();
      // Act
      await build({
        target,
        additionalArguments: [ "foo", "bar", "quux" ]
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "build", target, "foo", "bar", "quux" ],
          anything
        )
    });
  });

  describe(`test`, () => {
    const { test } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(test)
        .toBeAsyncFunction();
      // Assert
    });

    it(`should invoke dotnet test on provided solution / project`, async () => {
      // Arrange
      const expected = faker.word.sample();
      // Act
      await test({
        target: expected
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", expected ],
          anything
        )
    });

    [
      "m", "minimal",
      "q", "quiet",
      "n", "normal",
      "d", "detailed",
      "diag", "diagnostic"
    ].forEach(verbosity => {
      it(`should use the provided verbosity`, async () => {
        // Arrange
        const
          target = faker.word.sample();
        // Act
        await test({
          target,
          verbosity: verbosity as DotNetVerbosity
        });
        // Assert
        expect(spawn)
          .toHaveBeenCalledOnceWith(
            "dotnet", [ "test", target, "--verbosity", verbosity ],
            anything
          );
      });
    });

    it(`should use the provided configuration`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        configuration = faker.word.sample();
      // Act
      await test({
        target,
        configuration: configuration
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--configuration", configuration ],
          anything
        )
    });

    it(`should use the provided framework`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        framework = faker.word.sample();
      // Act
      await test({
        target,
        framework
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--framework", framework ],
          anything
        )
    });

    it(`should use the provided runtime`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        runtime = faker.word.sample();
      // Act
      await test({
        target,
        runtime
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--runtime", runtime ],
          anything
        )
    });

    it(`should use the provided architecture`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        arch = faker.word.sample();
      // Act
      await test({
        target,
        arch
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--arch", arch ],
          anything
        )
    });

    it(`should use the provided os`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        os = faker.word.sample();
      // Act
      await test({
        target,
        os
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--os", os ],
          anything
        )
    });

    it(`should set --no-build on request`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await test({
        target,
        noBuild: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--no-build" ],
          anything
        )
    });

    it(`should set --no-restore on request`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await test({
        target,
        noRestore: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--no-restore" ],
          anything
        )
    });

    it(`should set a single logger`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await test({
        target,
        loggers: {
          "console": {
            verbosity: "normal",
            foo: "bar"
          }
        }

      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--logger", "\"console;verbosity=normal;foo=bar\"" ],
          anything
        )
    });

    it(`should add msbuildProperties, when present`, async () => {
      // Arrange
      const target = faker.word.sample();
      // Act
      await test({
        target,
        msbuildProperties: {
          foo: "bar",
          quux: "wibbles and toast",
          "spaced arg": "more spaces"
        }
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "-p:foo=bar", `-p:quux="wibbles and toast"`, `-p:"spaced arg"="more spaces"` ],
          anything
        );
    });

    it(`should add additionalArguments, when set`, async () => {
      // Arrange
      const target = faker.word.sample();
      // Act
      await test({
        target,
        additionalArguments: [ "foo", "bar", "quux" ]
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "foo", "bar", "quux" ],
          anything
        )
    });

    it(`should set the settings file`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        settingsFile = faker.string.alphanumeric();
      // Act
      await test({
        target,
        settingsFile
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--settings", settingsFile ],
          anything
        )
    });

    it(`should set env vars`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await test({
        target,
        env: {
          foo: "bar",
          moo: "cow beef",
          "moo cow": "yum yum"
        }
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledWith(
          "dotnet", [ "test", target, "-e", "foo=bar", "-e", `moo="cow beef"`, "-e", `"moo cow"="yum yum"` ],
          anything
        )
    });

    it(`should pass through a provided filter`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await test({
        target,
        filter: "some filter expression"
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--filter", `"some filter expression"` ],
          anything
        )
    });

    it(`should pass through output location`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        output1 = faker.string.alphanumeric(),
        output2 = `${ faker.string.alphanumeric() } ${ faker.string.alphanumeric() }`;
      // Act
      await test({
        target,
        output: output1
      });
      await test({
        target,
        output: output2
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--output", output1 ],
          anything
        )
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--output", `"${ output2 }"` ],
          anything
        )
    });

    it(`should pass through diagnostics location`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        diagnostics1 = faker.string.alphanumeric(),
        diagnostics2 = `${ faker.string.alphanumeric() } ${ faker.string.alphanumeric() }`;
      // Act
      await test({
        target,
        diagnostics: diagnostics1
      });
      await test({
        target,
        diagnostics: diagnostics2
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--diag", diagnostics1 ],
          anything
        )
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "test", target, "--diag", `"${ diagnostics2 }"` ],
          anything
        )
    });

  });

  describe(`pack`, () => {
    const { pack } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(pack)
        .toBeAsyncFunction();
      // Assert
    });
    it(`should set the target`, async () => {
      // Arrange
      const target = faker.string.alphanumeric();
      // Act
      await pack({
        target
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target ],
          anything
        )
    });

    it(`should set the output`, async () => {
      // Arrange
      const
        target = faker.string.alphanumeric(),
        output = faker.string.alphanumeric();
      // Act
      await pack({
        target,
        output
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, "--output", output ],
          anything
        )
    });
    [
      "m", "minimal",
      "q", "quiet",
      "n", "normal",
      "d", "detailed",
      "diag", "diagnostic"
    ].forEach(verbosity => {
      it(`should use the provided verbosity`, async () => {
        // Arrange
        const
          target = faker.word.sample();
        // Act
        await pack({
          target,
          verbosity: verbosity as DotNetVerbosity
        });
        // Assert
        expect(spawn)
          .toHaveBeenCalledOnceWith(
            "dotnet", [ "pack", target, "--verbosity", verbosity ],
            anything
          );
      });
    });

    it(`should set the configuration`, async () => {
      // Arrange
      const
        target = faker.string.alphanumeric(),
        configuration = faker.string.alphanumeric();
      // Act
      await pack({
        target,
        configuration
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, "--configuration", configuration ],
          anything
        )
    });

    it(`should disable build on request`, async () => {
      // Arrange
      const
        target = faker.string.alphanumeric();
      // Act
      await pack({
        target,
        noBuild: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, "--no-build" ],
          anything
        )
    });

    it(`should include symbols on request`, async () => {
      // Arrange
      const
        target = faker.string.alphanumeric();
      // Act
      await pack({
        target,
        includeSymbols: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, "--include-symbols" ],
          anything
        )
    });

    it(`should include source on request`, async () => {
      // Arrange
      const target = faker.string.alphanumeric();
      // Act
      await pack({
        target,
        includeSource: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, "--include-source" ],
          anything
        )
    });

    it(`should skip restore on request`, async () => {
      // Arrange
      const target = faker.string.alphanumeric();
      // Act
      await pack({
        target,
        noRestore: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, "--no-restore" ],
          anything
        )
    });

    it(`should pass on the version suffix`, async () => {
      // Arrange
      const
        target = faker.string.alphanumeric(),
        versionSuffix = faker.system.semver();
      // Act
      await pack({
        target,
        versionSuffix
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, "--version-suffix", versionSuffix ],
          anything
        )
    });

    it(`should provide quick method for specifying a nuspec file (ie convert to msbuild prop)`, async () => {
      // Arrange
      const
        target = faker.string.alphanumeric(),
        nuspec = faker.string.alphanumeric();
      // Act
      await pack({
        target,
        nuspec,
        ignoreMissingNuspec: false
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, `-p:NuspecFile=${ nuspec }` ],
          anything
        )
    });

    it(`should provide quick method for specifying a nuspec file with spaces (ie convert to msbuild prop)`, async () => {
      // Arrange
      const
        target = faker.string.alphanumeric(),
        nuspec = `${ faker.string.alphanumeric() } ${ faker.string.alphanumeric() }`;
      // Act
      await pack({
        target,
        nuspec,
        ignoreMissingNuspec: false
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, `-p:NuspecFile="${ nuspec }"` ],
          anything
        )
    });

    it(`should test if the nuspec file exists by default (local, found)`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        project = faker.word.sample(),
        csproj = await sandbox.writeFile(`${ project }/${ project }.csproj`, "");
      await sandbox.writeFile(`${ project }/Package.nuspec`, "");

      // Act
      await pack({
        target: csproj,
        nuspec: "Package.nuspec"
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", csproj, `-p:NuspecFile=Package.nuspec` ],
          anything
        )
    });

    it(`should test if the nuspec file exists by default (local, not found)`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        project = faker.word.sample(),
        folder = await sandbox.mkdir(project),
        csproj = await sandbox.writeFile(`${ project }/${ project }.csproj`, "");
      // Act
      await pack({
        target: csproj,
        nuspec: "Package.nuspec"
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", csproj ],
          anything
        )
    });

    it(`should test if the nuspec file exists by default (relative, found)`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        project = faker.word.sample(),
        folder = await sandbox.mkdir(project),
        sub = await sandbox.mkdir(`${ project }/pack`),
        csproj = await sandbox.writeFile(`${ project }/${ project }.csproj`, ""),
        nuspec = await sandbox.writeFile(`${ project }/pack/Package.nuspec`, "");
      // Act
      await pack({
        target: csproj,
        nuspec: "pack/Package.nuspec"
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", csproj, `-p:NuspecFile=pack/Package.nuspec` ],
          anything
        )
    });

    it(`should test if the nuspec file exists by default (absoluet, found)`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        project = faker.word.sample(),
        folder = await sandbox.mkdir(project),
        sub = await sandbox.mkdir(`${ project }/pack`),
        csproj = await sandbox.writeFile(`${ project }/${ project }.csproj`, ""),
        nuspec = await sandbox.writeFile(`${ project }/pack/Package.nuspec`, "");
      // Act
      await pack({
        target: csproj,
        nuspec
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", csproj, `-p:NuspecFile=${ nuspec }` ],
          anything
        )
    });

  });

  afterEach(async () => {
    await Sandbox.destroyAll();
  })

  describe(`nugetPush`, () => {
    const { nugetPush } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(nugetPush)
        .toBeAsyncFunction();
      // Assert
    });
    it(`should attempt to push the target with the apiKey, with default source nuget.org`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10);
      // Act
      await nugetPush({
        target,
        apiKey
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org" ],
          anything
        )
    });
    it(`should set the timeout when provided`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10),
        timeout = faker.number.int({ min: 100, max: 500 });
      // Act
      await nugetPush({
        target,
        apiKey,
        timeout
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--timeout", `${ timeout }` ],
          anything
        )
    });
    it(`should set the symbol source when provided`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10),
        symbolSource = faker.internet.url();
      // Act
      await nugetPush({
        target,
        apiKey,
        symbolSource
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--symbol-source", symbolSource ],
          anything
        )
    });
    it(`should set the source when provided`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10),
        source = faker.internet.url();
      // Act
      await nugetPush({
        target,
        apiKey,
        source
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", source ],
          anything
        )
    });
    it(`should force english output on request`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10),
        forceEnglishOutput = true;
      // Act
      await nugetPush({
        target,
        apiKey,
        forceEnglishOutput
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--force-english-output" ],
          anything
        )
    });
    it(`should disable service endpoint on request`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10),
        noServiceEndpoint = true;
      // Act
      await nugetPush({
        target,
        apiKey,
        noServiceEndpoint
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--no-service-endpoint" ],
          anything
        )
    });
    it(`should skip duplicates on request`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10),
        skipDuplicate = true;
      // Act
      await nugetPush({
        target,
        apiKey,
        skipDuplicate
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--skip-duplicate" ],
          anything
        )
    });
    it(`should disable symbols on request`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10),
        noSymbols = true;
      // Act
      await nugetPush({
        target,
        apiKey,
        noSymbols
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--no-symbols" ],
          anything
        )
    });
    it(`should disable buffering on request`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10),
        disableBuffering = true;
      // Act
      await nugetPush({
        target,
        apiKey,
        disableBuffering
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--disable-buffering" ],
          anything
        )
    });
    it(`should not disable buffering on request`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10),
        disableBuffering = false;
      // Act
      await nugetPush({
        target,
        apiKey,
        disableBuffering
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org" ],
          anything
        )
    });
    it(`should set the symbol api key when provided`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        apiKey = faker.string.alphanumeric(10),
        symbolApiKey = faker.string.alphanumeric(10);
      // Act
      await nugetPush({
        target,
        apiKey,
        symbolApiKey
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--symbol-api-key", symbolApiKey ],
          anything
        )
    });
  });

  describe(`publish`, () => {
    const { publish } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(publish)
        .toBeAsyncFunction();
      // Assert
    });

    it(`should publish the target`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await publish({
        target
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target ],
          anything
        )
    });

    it(`should use the current runtime when set`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await publish({
        target,
        useCurrentRuntime: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--use-current-runtime" ],
          anything
        )
    });

    it(`should set the output`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        output = faker.word.sample();
      // Act
      await publish({
        target,
        output
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--output", output ],
          anything
        )
    });

    it(`should set the manifest`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        manifest = faker.word.sample();
      // Act
      await publish({
        target,
        manifest
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--manifest", manifest ],
          anything
        )
    });

    it(`should skip build on request`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await publish({
        target,
        noBuild: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--no-build" ],
          anything
        )
    });


    it(`should set the runtime, defaulting to self-contained`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        runtime = faker.word.sample();
      // Act
      await publish({
        target,
        runtime
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--runtime", runtime, "--self-contained" ],
          anything
        )
    });

    it(`should set self-contained, when selected`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        runtime = faker.word.sample();
      // Act
      await publish({
        target,
        runtime,
        selfContained: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--runtime", runtime, "--self-contained" ],
          anything
        )
    });

    it(`should set self-contained, when deselected`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        runtime = faker.word.sample();
      // Act
      await publish({
        target,
        runtime,
        selfContained: false
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--runtime", runtime, "--no-self-contained" ],
          anything
        )
    });

    it(`should set the framework`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        framework = faker.word.sample();
      // Act
      await publish({
        target,
        framework
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--framework", framework ],
          anything
        )
    });

    it(`should set the configuration`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        configuration = faker.word.sample();
      // Act
      await publish({
        target,
        configuration
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--configuration", configuration ],
          anything
        )
    });

    it(`should set the version suffix`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        versionSuffix = faker.word.sample();
      // Act
      await publish({
        target,
        versionSuffix
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--version-suffix", versionSuffix ],
          anything
        )
    });

    it(`should disable restore on request`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await publish({
        target,
        noRestore: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--no-restore" ],
          anything
        )
    });

    [
      "m", "minimal",
      "q", "quiet",
      "n", "normal",
      "d", "detailed",
      "diag", "diagnostic"
    ].forEach(verbosity => {
      it(`should use the provided verbosity`, async () => {
        // Arrange
        const
          target = faker.word.sample();
        // Act
        await publish({
          target,
          verbosity: verbosity as DotNetVerbosity
        });
        // Assert
        expect(spawn)
          .toHaveBeenCalledOnceWith(
            "dotnet", [ "publish", target, "--verbosity", verbosity ],
            anything
          );
      });
    });

    it(`should set the arch`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        arch = faker.word.sample();
      // Act
      await publish({
        target,
        arch
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--arch", arch ],
          anything
        )
    });

    it(`should set the os`, async () => {
      // Arrange
      const
        target = faker.word.sample(),
        os = faker.word.sample();
      // Act
      await publish({
        target,
        os
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--os", os ],
          anything
        )
    });

    it(`should disable build servers on request`, async () => {
      // Arrange
      const
        target = faker.word.sample();
      // Act
      await publish({
        target,
        disableBuildServers: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "publish", target, "--disable-build-servers" ],
          anything
        )
    });

    describe(`listPackages`, () => {
      const { listPackages } = sut;
      const exampleCsProj = path.join(
        __dirname,
        "csproj",
        "example.csproj"
      );
      it(`should be a function`, async () => {
        // Arrange
        // Act
        expect(listPackages)
          .toBeFunction();
        // Assert
      });
      it(`should list the example packages`, async () => {
        allowLogs = true;
        // Arrange
        const expected = [
          { id: "microsoft.net.test.sdk", version: "17.4.1" },
          { id: "NSubstitute", version: "4.4.0" },
          { id: "nunit", version: "3.13.3" },
          { id: "nunit3testadapter", version: "4.3.1" },
          { id: "system.valuetuple", version: "4.5.0" },
        ];
        // Act
        const result = await listPackages(exampleCsProj);
        // Assert
        expect(result)
          .toEqual(expected);
      });
    });

    describe(`containerisation`, () => {
      describe(`when publishContainer is true`, () => {
        describe(`when csproj doesn't reference Microsoft.NET.Build.Containers`, () => {
          const target = path.join(
            __dirname,
            "csproj",
            "example.csproj"
          );
          it(`should throw`, async () => {
            // Arrange
            // Act
            await expect(publish({
              target,
              publishContainer: true
            })).rejects.toThrow(/Microsoft.NET.Build.Containers/);
            // Assert
          });
        });
        describe(`when csproj _does_ reference Microsoft.NET.Build.Containers`, () => {
          const target = path.join(
            __dirname,
            "csproj",
            "containered.csproj"
          );
          it(`should set the /t:PublishContainer arg`, async () => {
            // Arrange
            // Act
            await publish({
              target,
              publishContainer: true
            });
            // Assert
            expect(spawn)
              .toHaveBeenCalledOnceWith(
                "dotnet", [ "publish", target, "-t:PublishContainer" ],
                anything
              );
          });

          it(`should set the container tag`, async () => {
            // Arrange
            const tag = faker.word.sample();
            // Act
            await publish({
              target,
              publishContainer: true,
              containerImageTag: tag
            });
            // Assert
            expect(spawn)
              .toHaveBeenCalledOnceWith(
                "dotnet", [ "publish", target, "-t:PublishContainer", `-p:ContainerImageTag=${ tag }` ],
                anything
              );
          });

          it(`should set the container registry`, async () => {
            // Arrange
            const registry = faker.internet.domainName();
            // Act
            await publish({
              target,
              publishContainer: true,
              containerRegistry: registry
            });
            // Assert
            expect(spawn)
              .toHaveBeenCalledOnceWith(
                "dotnet", [ "publish", target, "-t:PublishContainer", `-p:ContainerRegistry=${ registry }` ],
                anything
              );
          });

          it(`should set the container image name`, async () => {
            // Arrange
            const name = faker.word.sample();
            // Act
            await publish({
              target,
              publishContainer: true,
              containerImageName: name
            });
            // Assert
            expect(spawn)
              .toHaveBeenCalledOnceWith(
                "dotnet", [ "publish", target, "-t:PublishContainer", `-p:ContainerImageName=${ name }` ],
                anything
              );
          });
        });
      });
    });
  });

  describe(`resolveContainerOptions`, () => {
    const { resolveContainerOptions } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(resolveContainerOptions)
        .toBeFunction();
      // Assert
    });

    it(`should resolve provided tag`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        projFile = `${ faker.word.sample() }.csproj`,
        expected = {
          option: "containerImageTag",
          value: "1.2.3",
          environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_TAG,
          usingFallback: false
        } as ResolvedContainerOption,
        target = await sandbox.writeFile(projFile, csprojXml);
      // Act
      const result = await resolveContainerOptions({
        target,
        publishContainer: true,
        containerImageTag: "1.2.3"
      })
      // Assert
      const opt = result.find(o => o.option == "containerImageTag");
      expect(opt)
        .toEqual(expected);
    });

    it(`should resolve fallback tag`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        projFile = `${ faker.word.sample() }.csproj`,
        expected = {
          option: "containerImageTag",
          value: "3.5.4",
          environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_TAG,
          usingFallback: true
        } as ResolvedContainerOption,
        target = await sandbox.writeFile(projFile, csprojXml);
      // Act
      const result = await resolveContainerOptions({
        target,
        publishContainer: true
      })
      // Assert
      const opt = result.find(o => o.option == "containerImageTag");
      expect(opt)
        .toEqual(expected);
    });

    it(`should resolve registry from options`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        projFile = `${ faker.word.sample() }.csproj`,
        registry = faker.internet.domainName(),
        expected = {
          option: "containerRegistry",
          value: registry,
          environmentVariable: env.DOTNET_PUBLISH_CONTAINER_REGISTRY,
          usingFallback: false
        } as ResolvedContainerOption,
        target = await sandbox.writeFile(projFile, csprojXml);
      // Act
      const result = await resolveContainerOptions({
        target,
        publishContainer: true,
        containerRegistry: registry
      })
      // Assert
      const opt = result.find(o => o.option == "containerRegistry");
      expect(opt)
        .toEqual(expected);
    });

    it(`should resolve registry from csproj`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        projFile = `${ faker.word.sample() }.csproj`,
        expected = {
          option: "containerRegistry",
          value: "foo.bar.com",
          environmentVariable: env.DOTNET_PUBLISH_CONTAINER_REGISTRY,
          usingFallback: true
        } as ResolvedContainerOption,
        target = await sandbox.writeFile(projFile, csprojXml);
      // Act
      const result = await resolveContainerOptions({
        target,
        publishContainer: true
      })
      // Assert
      const opt = result.find(o => o.option == "containerRegistry");
      expect(opt)
        .toEqual(expected);
    });

    it(`should fall back on localhost when no registry specified via options or csproj`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        projFile = `${ faker.word.sample() }.csproj`,
        expected = {
          option: "containerRegistry",
          value: "localhost",
          environmentVariable: env.DOTNET_PUBLISH_CONTAINER_REGISTRY,
          usingFallback: true
        } as ResolvedContainerOption,
        modified = csprojXml.split("\n").filter(
          line => line.indexOf("<ContainerRegistry>") === -1
        ).join("\n"),
        target = await sandbox.writeFile(projFile, modified);
      // Act
      const result = await resolveContainerOptions({
        target,
        publishContainer: true
      })
      // Assert
      const opt = result.find(o => o.option == "containerRegistry");
      expect(opt)
        .toEqual(expected);
    });

    it(`should resolve the container name from the options`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        projFile = `${ faker.word.sample() }.csproj`,
        containerImageName = faker.word.sample(),
        expected = {
          option: "containerImageName",
          value: containerImageName,
          environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
          usingFallback: false
        } as ResolvedContainerOption,
        target = await sandbox.writeFile(projFile, csprojXml);
      // Act
      const result = await resolveContainerOptions({
        target,
        publishContainer: true,
        containerImageName
      })
      // Assert
      const opt = result.find(o => o.option == "containerImageName");
      expect(opt)
        .toEqual(expected);
    });

    it(`should resolve the container name from csproj`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        projFile = `${ faker.word.sample() }.csproj`,
        expected = {
          option: "containerImageName",
          value: "yellow-submarine",
          environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
          usingFallback: true
        } as ResolvedContainerOption,
        target = await sandbox.writeFile(projFile, csprojXml);
      // Act
      const result = await resolveContainerOptions({
        target,
        publishContainer: true
      })
      // Assert
      const opt = result.find(o => o.option == "containerImageName");
      expect(opt)
        .toEqual(expected);
    });

    it(`should fall back on the assembly name for the container name`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        projectName = faker.word.sample(),
        projFile = `${ projectName }.csproj`,
        expected = {
          option: "containerImageName",
          value: "Foo.Bar",
          environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
          usingFallback: true
        } as ResolvedContainerOption,
        filtered = csprojXml.split("\n").filter(
          line => line.indexOf("<ContainerImageName>") === -1
        ).join("\n"),
        target = await sandbox.writeFile(projFile, filtered);
      // Act
      const result = await resolveContainerOptions({
        target,
        publishContainer: true
      })
      // Assert
      const opt = result.find(o => o.option == "containerImageName");
      expect(opt)
        .toEqual(expected);
    });

    it(`should fall back on the project name for the container name`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        projectName = faker.word.sample(),
        projFile = `${ projectName }.csproj`,
        expected = {
          option: "containerImageName",
          value: projectName,
          environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
          usingFallback: true
        } as ResolvedContainerOption,
        filtered = csprojXml.split("\n").filter(
          line => line.indexOf("<ContainerImageName>") === -1 &&
            line.indexOf("<AssemblyName>") === -1
        ).join("\n"),
        target = await sandbox.writeFile(projFile, filtered);
      // Act
      const result = await resolveContainerOptions({
        target,
        publishContainer: true
      })
      // Assert
      const opt = result.find(o => o.option == "containerImageName");
      expect(opt)
        .toEqual(expected);
    });

    const csprojXml =
      `
    <Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <DebugType>full</DebugType>
    <LangVersion>latest</LangVersion>
    <TargetFrameworks>netstandard2.0;net452;net462</TargetFrameworks>
    <Configurations>Debug;Release;BuildForRelease</Configurations>
    <TreatWarningsAsErrors>True</TreatWarningsAsErrors>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <Version>1.0.171</Version>
    <AssemblyVersion>3.5.4</AssemblyVersion>
    <AssemblyName>Foo.Bar</AssemblyName>
    <ContainerRegistry>foo.bar.com</ContainerRegistry>
    <ContainerImageName>yellow-submarine</ContainerImageName>
  </PropertyGroup>
  <PropertyGroup>
    <PackageVersion>8.3.5</PackageVersion>
    <DefaultLanguage>en-US</DefaultLanguage>
    <PackageProjectUrl>https://github.com/fluffynuts/NExpect</PackageProjectUrl>
    <PackageLicenseExpression>BSD-3-Clause</PackageLicenseExpression>
    <PackageRequireLicenseAcceptance>False</PackageRequireLicenseAcceptance>
    <PackageIcon>icon.png</PackageIcon>
    <PackageIconUrl>https://raw.githubusercontent.com/fluffynuts/NExpect/master/src/NExpect/icon.png</PackageIconUrl>
    <Copyright>Copyright 2017</Copyright>
    <Authors>

      Davyd McColl

      Cobus Smit

    </Authors>
    <Description>

      Unit-test-framework-agnostic Expect-style assertions for .NET



      NExpect Provides Expect() syntax for doing assertions in .NET. Framework-agnostic, throwing

      UnmetExpectationExceptions for failures. Assertion exception type can be overridden at run-time.

      NExpect has grammar inspired by Chai and extensibility inspired by Jasmine.

    </Description>
  </PropertyGroup>
  <PropertyGroup Condition="'$(TargetFramework)'=='netstandard2.0'">
    <DefineConstants>NETSTANDARD</DefineConstants>
  </PropertyGroup>
  <PropertyGroup>
    <DefineConstants>BUILD_PEANUTBUTTER_INTERNAL</DefineConstants>
  </PropertyGroup>
  <ItemGroup>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\ArrayExtensions.cs" Link="Imported\\ArrayExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\AutoLocker.cs" Link="Imported\\AutoLocker.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\ByteArrayExtensions.cs" Link="Imported\\ByteArrayExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\DeepEqualityTester.cs" Link="Imported\\DeepEqualityTester.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\EnumerableWrapper.cs" Link="Imported\\EnumerableWrapper.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\ObjectExtensions.cs" Link="Imported\\ObjectExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\ExtensionsForIEnumerables.cs" Link="Imported\\ExtensionsForIEnumerables.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\MetadataExtensions.cs" Link="Imported\\MetadataExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\MemberNotFoundException.cs" Link="Imported\\MemberNotFoundException.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\PropertyOrField.cs" Link="Imported\\PropertyOrField.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\PyLike.cs" Link="Imported\\PyLike.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\StringExtensions.cs" Link="Imported\\StringExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\Stringifier.cs" Link="Imported\\Stringifier.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\TypeExtensions.cs" Link="Imported\\TypeExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\Types.cs" Link="Imported\\Types.cs"/>
  </ItemGroup>
  <ItemGroup Condition="'$(TargetFramework)'=='netstandard1.6'">
    <Reference Include="System.Diagnostics.StackTrace"/>
  </ItemGroup>
  <ItemGroup>
    <None Include="icon.png" Pack="true" PackagePath=""/>
  </ItemGroup>
  <Import Project="..\\MonoForFramework.targets"/>
</Project>
    `;

  });
});
