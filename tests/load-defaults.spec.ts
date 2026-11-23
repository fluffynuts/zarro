import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { fileExists, readTextFile } from "yafs";

const loadDefaults = require("../index-modules/load-defaults");
const log = requireModule<Log>("log");

describe(`load-defaults`, () => {
  type Env = Dictionary<string | undefined>;

  async function createSandboxWithDefaults(...lines: string[]) {
    const
      sandbox = await Sandbox.create(),
      defaultsFile = await sandbox.writeFile(".zarro-defaults", lines.join("\n"));
    return { sandbox, defaultsFile };
  }

  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(log, "warn").mockImplementation(() => {
    });
  });

  afterEach(() => {
    warn.mockRestore();
  });

  afterAll(async () => {
    await Sandbox.destroyAll();
  });

  it(`should create a defaults file when there isn't one`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      defaultsFile = sandbox.fullPathFor(".zarro-defaults"),
      env: Env = {};
    expect(await fileExists(defaultsFile))
      .toBeFalse();
    // Act
    await loadDefaults({ defaultsFile, env });
    // Assert
    expect(await fileExists(defaultsFile))
      .toBeTrue();
    expect(await readTextFile(defaultsFile))
      .toStartWith("# zarro defaults file:");
    expect(env)
      .toEqual({});
  });

  it(`should set variables which are not yet set`, async () => {
    // Arrange
    const
      { defaultsFile } = await createSandboxWithDefaults("FOO=bar", "QUX=quux"),
      env: Env = {};
    // Act
    await loadDefaults({ defaultsFile, env });
    // Assert
    expect(env)
      .toEqual({ FOO: "bar", QUX: "quux" });
  });

  it(`should not override variables which are already set`, async () => {
    // Arrange
    const
      { defaultsFile } = await createSandboxWithDefaults("FOO=from-defaults"),
      env: Env = { FOO: "from-environment" };
    // Act
    await loadDefaults({ defaultsFile, env });
    // Assert
    expect(env.FOO)
      .toEqual("from-environment");
  });

  it(`should override variables which are already set when the name is prefixed with !`, async () => {
    // Arrange
    const
      { defaultsFile } = await createSandboxWithDefaults("!FOO=from-defaults"),
      env: Env = { FOO: "from-environment" };
    // Act
    await loadDefaults({ defaultsFile, env });
    // Assert
    expect(env.FOO)
      .toEqual("from-defaults");
    expect(Object.keys(env))
      .not.toContain("!FOO");
  });

  it(`should delete a variable when it is forced with an empty value`, async () => {
    // Arrange
    const
      { defaultsFile } = await createSandboxWithDefaults("!FOO="),
      env: Env = { FOO: "from-environment" };
    // Act
    await loadDefaults({ defaultsFile, env });
    // Assert
    expect(Object.keys(env))
      .not.toContain("FOO");
  });

  it(`should ignore blank lines and comments, including trailing comments`, async () => {
    // Arrange
    const
      { defaultsFile } = await createSandboxWithDefaults(
        "# a comment",
        "",
        "   ",
        "FOO=bar # trailing comment",
        "  # indented comment"
      ),
      env: Env = {};
    // Act
    await loadDefaults({ defaultsFile, env });
    // Assert
    expect(env)
      .toEqual({ FOO: "bar" });
    expect(warn)
      .not.toHaveBeenCalled();
  });

  it(`should keep = characters which are part of the value`, async () => {
    // Arrange
    const
      { defaultsFile } = await createSandboxWithDefaults("CONNECTION=server=local;user=me"),
      env: Env = {};
    // Act
    await loadDefaults({ defaultsFile, env });
    // Assert
    expect(env.CONNECTION)
      .toEqual("server=local;user=me");
  });

  it(`should warn about, and skip, lines which are not VARIABLE=VALUE`, async () => {
    // Arrange
    const
      { defaultsFile } = await createSandboxWithDefaults("this is not valid", "FOO=bar"),
      env: Env = {};
    // Act
    await loadDefaults({ defaultsFile, env });
    // Assert
    expect(warn)
      .toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0])
      .toContain("this is not valid");
    expect(env)
      .toEqual({ FOO: "bar" });
  });
});
