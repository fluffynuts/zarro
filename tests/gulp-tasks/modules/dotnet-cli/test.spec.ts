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

describe(`test`, () => {
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
    expect(system)
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
      expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet",
        [ "test", target, "-p:foo=bar", `-p:quux="wibbles and toast"`, `-p:"spaced arg"="more spaces"` ],
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
    expect(system)
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet", [ "test", target, "--settings", settingsFile ],
        anything
      )
  });

  it(`should set env vars`, async () => {
    // Arrange
    const
      testEnv = {
        foo: "bar",
        moo: "cow beef",
        "moo cow": "yum yum"
      } as Dictionary<string>,
      target = faker.word.sample();
    // Act
    await test({
      target,
      env: testEnv
    });
    // Assert
    expect(system)
      .toHaveBeenCalledWith(
        "dotnet", [ "test", target ],
        anything
      )
    const testCall = system.mock.calls.find(
      (a: any) => a[0] === "dotnet" && a[1][0] === "test"
    );
    expect(testCall)
      .toExist();
    const opts = testCall[2];
    expect(opts.env)
      .toExist();
    for (const k of Object.keys(testEnv)) {
      expect(opts.env[k])
        .toEqual(testEnv[k]);
    }
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
    expect(system)
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet", [ "test", target, "--output", output1 ],
        anything
      )
    expect(system)
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
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet", [ "test", target, "--diag", diagnostics1 ],
        anything
      )
    expect(system)
      .toHaveBeenCalledOnceWith(
        "dotnet", [ "test", target, "--diag", `"${ diagnostics2 }"` ],
        anything
      )
  });

});
