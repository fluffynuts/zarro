import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { Sandbox } from "filesystem-sandbox";

describe(`nuget-cli`, () => {
  const path = require("path");
  const systemMock = jest.fn();
  jest.doMock("../../../gulp-tasks/modules/system", () => systemMock);
  const resolveNugetMock = jest.fn();
  jest.doMock("../../../gulp-tasks/modules/resolve-nuget", () => resolveNugetMock);

  let nuget = "/path/to/nuget";
  const
    {
      objectContaining,
      anything
    } = expect,
    sut = requireModule<NugetCli>("nuget-cli"),
    SystemResult = requireModule<SystemResult>("system-result");


  describe(`install`, () => {
    const { install } = sut;

    it(`should attempt to install the requested package`, async () => {
      // Arrange
      const
        packageId = randomPackageId();
      // Act
      await install({ packageId });
      // Assert
      expect(systemMock)
        .toHaveBeenCalledOnceWith(
          nuget,
          [ "install", packageId, "-NonInteractive" ],
          objectContaining({ suppressOutput: true })
        );
    });

    describe(`optional parameters`, () => {
      it(`should observe version`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          version = randomVersion();
        // Act
        await install({
          packageId,
          version
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-Version", version ],
            anything()
          );
      });

      it(`should observe outputDirectory`, async () => {
        // Arrange
        const
          sandbox = await Sandbox.create(),
          packageId = randomPackageId(),
          outputDirectory = path.join(sandbox.path, "nuget-target");
        // Act
        await install({
          packageId,
          outputDirectory
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-OutputDirectory", outputDirectory ],
            anything()
          );
      });

      it(`should observe dependencyVersion`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          dependencyVersion = faker.word.sample();
        // Act
        await install({
          packageId,
          dependencyVersion
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-DependencyVersion", dependencyVersion ],
            anything()
          );
      });

      it(`should observe framework`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          framework = faker.word.sample();
        // Act
        await install({
          packageId,
          framework
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-Framework", framework ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe excludeVersion`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          excludeVersion = randomVersion();
        // Act
        await install({
          packageId,
          excludeVersion
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-ExcludeVersion", excludeVersion ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe preRelease (true)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          preRelease = true;
        // Act
        await install({
          packageId,
          preRelease
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-Prerelease" ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe preRelease (false)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          preRelease = false;
        // Act
        await install({
          packageId,
          preRelease
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive" ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe requireConsent (true)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          requireConsent = true;
        // Act
        await install({
          packageId,
          requireConsent
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-RequireConsent" ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe requireConsent (false)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          requireConsent = false;
        // Act
        await install({
          packageId,
          requireConsent
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe solutionDirectory`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          solutionDirectory = randomVersion();
        // Act
        await install({
          packageId,
          solutionDirectory
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-SolutionDirectory", solutionDirectory ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe source`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          source = faker.internet.url();
        // Act
        await install({
          packageId,
          source
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-Source", source ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe fallbackSource`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          fallbackSource = faker.internet.url();
        // Act
        await install({
          packageId,
          fallbackSource
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-FallbackSource", fallbackSource ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe noCache (true)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          noCache = true;
        // Act
        await install({
          packageId,
          noCache
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-NoCache" ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe noCache (false)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          noCache = false;
        // Act
        await install({
          packageId,
          noCache
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive" ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe directDownload (true)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          directDownload = true;
        // Act
        await install({
          packageId,
          directDownload
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-DirectDownload" ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe disableParallelProcessing (true)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          disableParallelProcessing = true;
        // Act
        await install({
          packageId,
          disableParallelProcessing
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-DisableParallelProcessing" ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe disableParallelProcessing (false)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          disableParallelProcessing = false;
        // Act
        await install({
          packageId,
          disableParallelProcessing
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive" ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe packageSaveMode`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          packageSaveMode = faker.helpers.arrayElement([
            "nuspec",
            "nupkg"
          ]) satisfies NugetPackageSaveMode;
        // Act
        await install({
          packageId,
          packageSaveMode: packageSaveMode as any
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-PackageSaveMode", packageSaveMode ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe packageSaveMode (delimited)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          packageSaveMode = "nuspec;nupkg";
        // Act
        await install({
          packageId,
          packageSaveMode: packageSaveMode as any
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-PackageSaveMode", `"${ packageSaveMode }"` ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe verbosity`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          verbosity = faker.helpers.arrayElement([
            "normal",
            "quiet",
            "detailed"
          ]) satisfies NugetVerbosity;
        // Act
        await install({
          packageId,
          verbosity
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-Verbosity", verbosity ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe nonInteractive (false)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          nonInteractive = false;
        // Act
        await install({
          packageId,
          nonInteractive
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId ],
            objectContaining({ suppressOutput: false })
          );
      });

      it(`should observe configFile`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          configFile = faker.system.filePath();
        // Act
        await install({
          packageId,
          configFile
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-ConfigFile", configFile ],
            objectContaining({ suppressOutput: true })
          );
      });

      it(`should observe forceEnglishOutput (true)`, async () => {
        // Arrange
        const
          packageId = randomPackageId(),
          forceEnglishOutput = true;
        // Act
        await install({
          packageId,
          forceEnglishOutput
        });
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-ForceEnglishOutput" ],
            objectContaining({ suppressOutput: true })
          );
      });

    });
  });

  describe(`clearing cache`, () => {
    const {
      clearHttpCache,
      clearAllCache
    } = sut;
    describe(`clearAllCache`, () => {
      it(`should clear all cache `, async () => {
        // Arrange
        // Act
        await clearAllCache();
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "locals", "-clear" ],
            objectContaining({ suppressOutput: true })
          );
      });
    });
    describe(`clearHttpCache`, () => {
      it(`should clear the http cache only`, async () => {
        // Arrange
        // Act
        await clearHttpCache();
        // Assert
        expect(systemMock)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "locals", "http-cache", "-clear" ],
            objectContaining({ suppressOutput: true })
          );
      });
    });
  });

  function randomPackageId() {
    return faker.word.words(3)
      .replace(/\s+/g, ".");
  }

  function randomVersion() {
    return [
      faker.number.int({
        min: 0,
        max: 9
      }),
      faker.number.int({
        min: 0,
        max: 9
      }),
      faker.number.int({
        min: 0,
        max: 9
      }),
    ].join(".")
  }

  beforeEach(() => {
    setupMocks();
  });
  afterEach(async () => {
    await Sandbox.destroyAll();
  });

  let i = 0;

  function setupMocks() {
    nuget = `/${ i++ }/path/to/nuget`;
    systemMock.mockImplementation((exe: string, args: string[], opts: SystemOptions) => {
      return new SystemResult(
        exe,
        args || [],
        0,
        [],
        []
      );
    });
    resolveNugetMock.mockImplementation(() => nuget);
  }
});
