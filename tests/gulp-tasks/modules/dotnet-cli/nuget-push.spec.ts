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

describe(`dotnet-cli:nugetPush`, () => {
  beforeEach(() => {
    mockSystem();
    mockUpdatePackageNuspec();
    disableSystemCallThrough();
    spyOn(console, "log");
    spyOn(process.stdout, "write");
  });

  afterEach(async () => {
    await Sandbox.destroyAll();
  })
  const sut = requireModule<DotNetCli>("dotnet-cli");
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet", [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org" ],
        anything
      )
    expect(process.stdout.write)
      .toHaveBeenCalledWith(
        expect.stringContaining(`Pushing ${target}`)
      );
  });
  it(`should set the timeout when provided`, async () => {
    // Arrange
    const
      target = faker.word.sample(),
      apiKey = faker.string.alphanumeric(10),
      timeout = faker.number.int({
        min: 100,
        max: 500
      });
    // Act
    await nugetPush({
      target,
      apiKey,
      timeout
    });
    // Assert
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet",
        [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--timeout", `${ timeout }` ],
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet",
        [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--symbol-source", symbolSource ],
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
    expect(system)
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet",
        [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--force-english-output" ],
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet",
        [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--no-service-endpoint" ],
        anything
      )
  });
  it(`should skip duplicates on request`, async () => {
    // Arrange
    const
      target = faker.word.sample(),
      apiKey = faker.string.alphanumeric(10),
      skipDuplicates = true;
    // Act
    await nugetPush({
      target,
      apiKey,
      skipDuplicates
    });
    // Assert
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet",
        [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--skip-duplicate" ],
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
    expect(system)
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet",
        [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--disable-buffering" ],
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
    expect(system)
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet",
        [ "nuget", "push", target, "--api-key", apiKey, "--source", "nuget.org", "--symbol-api-key", symbolApiKey ],
        anything
      )
  });
});
