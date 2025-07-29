import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { Sandbox } from "filesystem-sandbox";
import Mock = jest.Mock;
import * as systemWrapper from "system-wrapper";

describe(`nuget-cli`, () => {
  const { spyOn } = jest;
  const path = require("path");
  let isSystemError = false;
  const realSystemWrapper = { ...systemWrapper };
  jest.doMock("system-wrapper", () => realSystemWrapper);
  const resolveNugetMock = jest.fn();
  jest.doMock("../../../gulp-tasks/modules/resolve-nuget", () => resolveNugetMock);
  const log = requireModule<Log>("log");

  let nuget = "/path/to/nuget";
  const
    {
      objectContaining,
      anything
    } = expect,
    sut = requireModule<NugetCli>("nuget-cli");

  describe(`install`, () => {
    const { install } = sut;

    it(`should attempt to install the requested package`, async () => {
      // Arrange
      const
        packageId = randomPackageId();
      // Act
      await install({ packageId });
      // Assert
      expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "install", packageId, "-NonInteractive", "-PackageSaveMode", `"${packageSaveMode}"` ],
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
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
        expect(realSystemWrapper.system)
          .toHaveBeenCalledOnceWith(
            nuget,
            [ "locals", "http-cache", "-clear" ],
            objectContaining({ suppressOutput: true })
          );
      });
    });
  });

  describe(`list sources`, () => {
    const { listSources } = requireModule<NugetCli>("nuget-cli");
    it(`should list the sources`, async () => {
      // Arrange
      const
        customUrl = faker.internet.url(),
        customEnabled = faker.datatype.boolean();
      mockAvailableSources([
        {
          name: "nuget.org",
          url: "https://api.nuget.org/v3/index.json",
          enabled: true
        },
        {
          name: "custom",
          url: customUrl,
          enabled: customEnabled
        }
      ]);
      // Act
      const result = await listSources();
      // Assert
      expect(result.length)
        .toEqual(2);
      expect(result.find(o =>
        o.name == "nuget.org" &&
        o.url == "https://api.nuget.org/v3/index.json" &&
        o.enabled
      )).toExist();
      expect(result.find(o =>
        o.name == "custom" &&
        o.url == customUrl &&
        o.enabled == customEnabled
      )).toExist();
    });
  });

  const nugetOrgSource = {
    name: "nuget.org",
    url: "https://api.nuget.org/v3/index.json",
    enabled: true
  } satisfies NugetSource;

  describe(`adding sources`, () => {
    const {
      addSource
    } = requireModule<NugetCli>("nuget-cli");
    it(`should add the source when not found`, async () => {
      // Arrange
      mockAvailableSources([
        nugetOrgSource
      ]);
      const
        configFile = faker.system.filePath(),
        password = faker.string.alphanumeric(),
        expectedName = faker.word.sample(),
        expectedUrl = faker.internet.url(),
        username = faker.string.alphanumeric(),
        validAuthenticationTypes = faker.string.alphanumeric(),
        storePasswordInClearText = true;
      // Act
      await addSource({
        name: expectedName,
        url: expectedUrl,
        enabled: true,
        configFile,
        password,
        storePasswordInClearText,
        username,
        validAuthenticationTypes
      });
      // Assert
      expect(realSystemWrapper.system)
        .toHaveBeenCalledOnceWith(
          expect.stringContaining("nuget"),
          [
            "source", "add",
            "-Name", expectedName,
            "-Source", expectedUrl,
            "-Username", username,
            "-Password", password,
            "-StorePasswordInClearText",
            "-NonInteractive",
            "-ValidAuthenticationTypes", validAuthenticationTypes,
            "-ConfigFile", configFile,
            "-ForceEnglishOutput"
          ],
          expect.objectContaining({ suppressOutput: true })
        );
    });

    it(`should not add the source if found, enabled, by name`, async () => {
      // Arrange
      const
        name = faker.string.alphanumeric(),
        url = faker.internet.url(),
        enabled = true;
      mockAvailableSources([
        nugetOrgSource,
        {
          url,
          name,
          enabled
        }
      ])
      // Act
      await addSource({
        name,
        url,
        enabled
      });
      // Assert
      expect(realSystemWrapper.system)
        .not.toHaveBeenCalledWith(
        expect.stringContaining("nuget"),
        expect.arrayContaining([ "source", "add" ])
      );
    });

    it(`should enable the source if found, disabled, by name`, async () => {
      // Arrange
      const
        name = faker.string.alphanumeric(),
        url = faker.internet.url(),
        enabled = false;
      mockAvailableSources([
        nugetOrgSource,
        {
          url,
          name,
          enabled
        }
      ])
      // Act
      await addSource({
        name,
        url,
        enabled
      });
      // Assert
      expect(realSystemWrapper.system)
        .not.toHaveBeenCalledWith(
        expect.stringContaining("nuget"),
        expect.arrayContaining([ "source", "add" ])
      );
      expect(realSystemWrapper.system)
        .toHaveBeenCalledWith(
          expect.stringContaining("nuget"),
          [ "source", "enable", "-Name", name ],
          expect.objectContaining({ suppressOutput: true })
        );
    });
  });

  describe(`enabling sources`, () => {
    const { enableSource } = requireModule<NugetCli>("nuget-cli");
    it(`should enable the existing, disabled source`, async () => {
      // Arrange
      const
        name = faker.string.alphanumeric(),
        randomCasedName = randomCase(name),
        url = faker.internet.url(),
        enabled = false;
      mockAvailableSources([
        nugetOrgSource,
        {
          url,
          name,
          enabled
        }
      ])
      // Act
      await enableSource(randomCasedName);
      // Assert
      expect(realSystemWrapper.system)
        .toHaveBeenCalledWith(
          expect.stringContaining("nuget"),
          [ "source", "enable", "-Name", randomCasedName ],
          expect.objectContaining({ suppressOutput: true })
        );
    });

    it(`should do nothing when the source exists and is enabled`, async () => {
      // Arrange
      const
        name = faker.string.alphanumeric(),
        randomCasedName = randomCase(name),
        url = faker.internet.url(),
        enabled = true;
      mockAvailableSources([
        nugetOrgSource,
        {
          url,
          name,
          enabled
        }
      ])
      // Act
      await enableSource(randomCasedName);
      expect(realSystemWrapper.system)
        .not.toHaveBeenCalledWith(
        expect.stringContaining("nuget"),
        [ "source", "enable", "-Name", randomCasedName ],
        expect.objectContaining({ suppressOutput: true })
      );
      // Assert
    });

    it(`should throw if the source is not known`, async () => {
      // Arrange
      mockAvailableSources([ nugetOrgSource ]);
      // Act
      await expect(enableSource(faker.string.alphanumeric()))
        .rejects.toThrow(/source is unknown/i);
      // Assert
    });
  });

  describe(`disabling sources`, () => {
    const { disableSource } = requireModule<NugetCli>("nuget-cli");
    it(`should disable the existing, enabled source`, async () => {
      // Arrange
      const
        name = faker.string.alphanumeric(),
        randomCasedName = randomCase(name),
        url = faker.internet.url(),
        enabled = true;
      mockAvailableSources([
        nugetOrgSource,
        {
          url,
          name,
          enabled
        }
      ])
      // Act
      await disableSource(randomCasedName);
      // Assert
      expect(realSystemWrapper.system)
        .toHaveBeenCalledWith(
          expect.stringContaining("nuget"),
          [ "source", "disable", "-Name", randomCasedName ],
          expect.objectContaining({ suppressOutput: true })
        );
    });

    it(`should do nothing when the source exists and is disabled`, async () => {
      // Arrange
      const
        name = faker.string.alphanumeric(),
        randomCasedName = randomCase(name),
        url = faker.internet.url(),
        enabled = false;
      mockAvailableSources([
        nugetOrgSource,
        {
          url,
          name,
          enabled
        }
      ])
      // Act
      await disableSource(randomCasedName);
      expect(realSystemWrapper.system)
        .not.toHaveBeenCalledWith(
        expect.stringContaining("nuget"),
        [ "source", "disable", "-Name", randomCasedName ],
        expect.objectContaining({ suppressOutput: true })
      );
      // Assert
    });

    it(`should throw if the source is not known`, async () => {
      // Arrange
      mockAvailableSources([ nugetOrgSource ]);
      // Act
      await expect(disableSource(faker.string.alphanumeric()))
        .rejects.toThrow(/source is unknown/i);
      // Assert
    });
  });

  function mockAvailableSources(sources: NugetSource[]) {
    (realSystemWrapper.system as any as Mock).mockImplementation((
      exe: string,
      args: string[],
      opts?: SystemOptions
    ) => {
      debugger;
      if ([ "sources", "list" ].every((el, idx) => el === args[idx])) {
        const lines = [] as string[];
        let idx = 1;
        for (const src of sources) {
          lines.push(`${idx++}.  ${src.name} [${(src.enabled ? "Enabled" : "Disabled")}]`);
          lines.push(`    ${src.url}`);
          if (typeof opts?.stdout === "function") {
            for (const line of lines) {
              opts.stdout(line)
            }
          }
        }
        const result = systemWrapper.SystemResult.create()
          .withExe(exe)
          .withArgs(args)
          .withStdOut(lines)
          .withStdErr([])
          .withExitCode(0)
          .build();
        return Promise.resolve(result);
      }
      return Promise.resolve(
        systemWrapper.SystemResult.create()
          .withExitCode(0)
          .withExe(exe)
          .withArgs(args)
          .withStdOut([])
          .withStdErr([])
          .build()
      );
    });
  }

  function randomCase(str: string): string {
    const collector = [];
    for (const c of (str || "")) {
      collector.push(
        faker.datatype.boolean()
          ? c
          : swapCase(c)
      )
    }
    return collector.join("");
  }

  function swapCase(c: string) {
    return c.toUpperCase() === c
      ? c.toLowerCase()
      : c.toUpperCase();
  }

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
    nuget = `/${i++}/path/to/nuget`;
    spyOn(realSystemWrapper, "system")
      .mockImplementation((exe: string, args?: string[], opts?: SystemOptions) => {
        return new Promise<SystemResult>(resolve => {
          resolve(
            new systemWrapper.SystemResult(
              exe,
              args || [],
              0,
              [],
              []
            )
          );
        });
      });
    // for some reason, these don't come through on the destructure
    realSystemWrapper.system.isError = systemWrapper.system.isError;
    realSystemWrapper.system.isResult = systemWrapper.system.isResult;
    expect(typeof realSystemWrapper.system.isError)
      .toEqual("function");
    expect(typeof realSystemWrapper.system.isResult)
      .toEqual("function");
    (realSystemWrapper.system.isError as any) = jest.fn()
      .mockImplementation(() => isSystemError);
    (realSystemWrapper.system.isResult as any) = jest.fn()
      .mockImplementation(() => !isSystemError);
    resolveNugetMock.mockImplementation(() => nuget);
    spyOn(log, "info");
  }
});
