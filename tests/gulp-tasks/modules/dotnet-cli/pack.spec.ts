import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { Sandbox } from "filesystem-sandbox";

const {
  anything,
  packageNuspec,
  mockUpdatePackageNuspec,
  mockSystem,
  systemPre,
  system,
  disableSystemCallThrough,
  updateNuspecVersionPre,
  updateNuspecVersion
} = require("./common");
const log = requireModule<Log>("log");

describe(`dotnet-cli:pack`, () => {
  const sut = requireModule<DotNetCli>("dotnet-cli");
  const { pack } = sut;

  beforeEach(() => {
    mockSystem();
    mockUpdatePackageNuspec();
    disableSystemCallThrough();
    spyOn(console, "log");
  });

  afterEach(async () => {
    await Sandbox.destroyAll();
  })

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
    expect(system)
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
    expect(system)
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
      expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet", [ "pack", target, "--version-suffix", versionSuffix ],
        anything
      )
  });

  describe(`when nuspec is specified`, () => {
    it(`should provide quick method for specifying a nuspec file (ie convert to msbuild prop)`, async () => {
      // Arrange
      const
        target = faker.string.alphanumeric(),
        sandbox = await Sandbox.create(),
        nuspec = await sandbox.writeFile(
          `${ faker.string.alphanumeric() }.nuspec`,
          packageNuspec
        );
      // Act
      await pack({
        target,
        nuspec,
      });
      // Assert
      expect(system)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, `-p:NuspecFile=${ nuspec }` ],
          anything
        )
    });

    it(`should allow for optional nuspec path via trailing ?`, async () => {
      // Arrange
      const
        target = faker.string.alphanumeric();
      // Act
      await expect(pack({
        target,
        nuspec: "Package.nuspec?"
      }))
        .resolves.not.toThrow();
      // Assert
      expect(system)
        .toHaveBeenCalledOnceWith(
          "dotnet",
          [ "pack", target ],
          anything
        );
    });

    it(`should use the optional nuspec when it's available`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        target = await sandbox.writeFile(faker.string.alphanumeric(), "(csproj)"),
        nuspec = await sandbox.writeFile("MooCakes.nuspec", "(nuspec)");
      // Act
      await pack({
        target,
        nuspec: "MooCakes.nuspec?"
      });
      // Assert
      expect(system)
        .toHaveBeenCalledOnceWith(
          "dotnet",
          [ "pack", target, `-p:NuspecFile=MooCakes.nuspec` ],
          anything
        );
    });

    function randomVersion() {
      return `${
        faker.number.int({
          min: 1,
          max: 5
        })
      }.${
        faker.number.int({
          min: 0,
          max: 9
        })
      }.${
        faker.number.int({
          min: 0,
          max: 9
        })
      }`;
    }

    interface RecordedCall {
      method: string;
      args: any[];
    }

    it(`should modify the version in the nuspec file during packing, when versionSuffix is provided`, async () => {
      // `dotnet pack` will ignore the --version-suffix provided on the CLI when using a package nuspec file - instead,
      // the version will come wholly from the Package.nuspec, so we have to slide that in during packing
      // Arrange
      spyOn(log, "warn");
      const
        target = faker.string.alphanumeric(),
        versionSuffix = randomVersion(),
        sandbox = await Sandbox.create(),
        nuspec = await sandbox.writeFile(
          "Package.nuspec",
          packageNuspec
        ),
        calls = [] as RecordedCall[];
      updateNuspecVersionPre.mockImplementation(
        (fileOrXml: string, newVersion: string) => {
          calls.push({
            method: "updateNuspecVersion",
            args: [ fileOrXml, newVersion ]
          });
        }
      );
      systemPre.mockImplementation(
        (exe: string, args: string[], opts: SystemOptions) => {
          calls.push({
            method: "system",
            args: [ exe, args, opts ]
          });
        });
      // Act
      await pack({
        target,
        nuspec,
        versionSuffix
      });
      // Assert
      expect(updateNuspecVersion)
        .toHaveBeenCalledWith(nuspec, versionSuffix);
      const q = nuspec.indexOf(" ") > -1 ? '"' : '';
      expect(system)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, `-p:NuspecFile=${ q }${ nuspec }${ q }` ],
          anything
        )
      expect(updateNuspecVersion)
        .toHaveBeenCalledWith(nuspec, "1.0.158");

      expect(calls.map(o => o.method))
        .toEqual([
          "updateNuspecVersion",
          "system",
          "updateNuspecVersion"
        ]);
      expect(log.warn)
        .toHaveBeenCalledOnceWith(
          expect.stringMatching(new RegExp(`will be temporarily set to ${versionSuffix}`))
        );
    });
  });

  it(
    `should provide quick method for specifying a nuspec file with spaces (ie convert to msbuild prop)`,
    async () => {
      // Arrange
      const
        target = faker.string.alphanumeric(),
        sandbox = await Sandbox.create(),
        nuspec = await sandbox.writeFile(
          `${ faker.string.alphanumeric() } ${ faker.string.alphanumeric() }.nuspec`,
          packageNuspec
        );
      // Act
      await pack({
        target,
        nuspec
      });
      // Assert
      expect(system)
        .toHaveBeenCalledOnceWith(
          "dotnet", [ "pack", target, `-p:NuspecFile="${ nuspec }"` ],
          anything
        )
    }
  );

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
    expect(system)
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
      csproj = await sandbox.writeFile(`${ project }/${ project }.csproj`, "");
    // Act
    await expect(pack({
      target: csproj,
      nuspec: "Package.nuspec"
    })).rejects.toThrow(/nuspec file not found/);
    // Assert
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet", [ "pack", csproj, `-p:NuspecFile=pack/Package.nuspec` ],
        anything
      )
  });

  it(`should test if the nuspec file exists by default (absolute, found)`, async () => {
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet", [ "pack", csproj, `-p:NuspecFile=${ nuspec }` ],
        anything
      )
  });

});
