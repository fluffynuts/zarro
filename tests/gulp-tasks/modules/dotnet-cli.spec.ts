import "expect-even-more-jest";
import { faker } from "@faker-js/faker";

describe("dotnet-cli", () => {
  const
    realSpawn = require("../../../gulp-tasks/modules/spawn"),
    spawn = jest.fn().mockImplementation((exe, args, opts) => {
      if (args[0] == "nuget" && args[1] == "list") {
        return realSpawn(exe, args, opts)
      }
      return Promise.resolve();
    }),
    requireModuleActual = require("../../../gulp-tasks/modules/require-module");
  requireModuleActual.mock("spawn", spawn);

  const sut = requireModule<DotNetCli>("dotnet-cli");
  const anything = expect.any(Object);

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
        configuration
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
        configuration
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
          "dotnet", [ "test", target, "--logger", "console;verbosity=normal;foo=bar" ],
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
        nuspec
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", ["pack", target, `-p:NuspecFile=${nuspec}` ],
          anything
        )
    });
    it(`should provide quick method for specifying a nuspec file with spaces (ie convert to msbuild prop)`, async () => {
      // Arrange
      const
        target = faker.string.alphanumeric(),
        nuspec = `${faker.string.alphanumeric()} ${faker.string.alphanumeric()}`;
      // Act
      await pack({
        target,
        nuspec
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", ["pack", target, `-p:NuspecFile="${nuspec}"` ],
          anything
        )
    });
  });

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
          "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--timeout", `${timeout}` ],
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
});
