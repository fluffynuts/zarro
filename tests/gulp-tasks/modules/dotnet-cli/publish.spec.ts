import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { Sandbox } from "filesystem-sandbox";
import path from "path";

const {
  anything,
  system,
  disableSystemCallThrough,
  mockSystem,
  mockUpdatePackageNuspec,
} = require("./common");

describe(`dotnet-cli:publish`, () => {
  let allowLogs = false;
  beforeEach(() => {
    allowLogs = false;
    mockSystem();
    mockUpdatePackageNuspec();
    disableSystemCallThrough();
    const original = console.log;
    spyOn(console, "log").and.callFake((...args: any[]) => {
      if (!allowLogs) {
        return;
      }
      original.apply(console, args);
    });
  });

  afterEach(async () => {
    await Sandbox.destroyAll();
  })
  const sut = requireModule<DotNetCli>("dotnet-cli");
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
      expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet", [ "publish", target, "--disable-build-servers" ],
        anything
      )
  });

  describe(`listPackages`, () => {
    const { listPackages } = sut;
    const exampleCsProj = path.resolve(
      path.join(
        __dirname,
        "..",
        "csproj",
        "example.csproj"
      )
    );
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(listPackages)
        .toBeFunction();
      // Assert
    });
    it(`should list the example packages`, async () => {
      expect(exampleCsProj)
        .toBeFile();
      allowLogs = true;
      // Arrange
      const expected = [
        {
          id: "microsoft.net.test.sdk",
          version: "17.4.1"
        },
        {
          id: "NSubstitute",
          version: "4.4.0"
        },
        {
          id: "nunit",
          version: "3.13.3"
        },
        {
          id: "nunit3testadapter",
          version: "4.3.1"
        },
        {
          id: "system.valuetuple",
          version: "4.5.0"
        },
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
          "..",
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
        const target = path.resolve(
          path.join(
            __dirname,
            "..",
            "csproj",
            "containered.csproj"
          )
        );
        it(`should set the /t:PublishContainer arg`, async () => {
          // Arrange
          expect(target)
            .toBeFile();
          // Act
          await publish({
            target,
            publishContainer: true
          });
          // Assert
          expect(system)
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
          expect(system)
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
          expect(system)
            .toHaveBeenCalledOnceWith(
              "dotnet",
              [ "publish", target, "-t:PublishContainer", `-p:ContainerRegistry=${ registry }` ],
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
          expect(system)
            .toHaveBeenCalledOnceWith(
              "dotnet",
              [ "publish", target, "-t:PublishContainer", `-p:ContainerImageName=${ name }` ],
              anything
            );
        });
      });
    });
  });
});
