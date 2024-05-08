import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { Sandbox } from "filesystem-sandbox";

const {
  anything,
  system,
  disableSystemCallThrough,
  mockSystem,
  mockUpdatePackageNuspec,
} = require("./common");

describe(`dotnet-cli:clean`, () => {
  beforeEach(() => {
    mockSystem();
    mockUpdatePackageNuspec();
    disableSystemCallThrough();
    spyOn(console, "log");
  });

  afterEach(async () => {
    await Sandbox.destroyAll();
  })
  const sut = requireModule<DotNetCli>("dotnet-cli");
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
      .toHaveBeenCalledTimes(2);
    expect(system)
      .toHaveBeenCalledWith(
        "dotnet", [ "clean", target, "--configuration", configuration1 ],
        anything
      );
    expect(system)
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
      expect(system)
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet", [ "clean", target, "--output", output ],
        anything
      );
  });

});
