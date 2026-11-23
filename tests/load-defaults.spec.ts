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

  it(`should create a skeleton which sets nothing and warns about nothing when loaded`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      defaultsFile = sandbox.fullPathFor(".zarro-defaults"),
      env: Env = {};
    await loadDefaults({ defaultsFile, env });
    // Act
    await loadDefaults({ defaultsFile, env, taskName: "release" });
    // Assert
    expect(env)
      .toEqual({});
    expect(warn)
      .not.toHaveBeenCalled();
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

  describe(`precedence within the file`, () => {
    it(`should let a later line override an earlier line for the same variable`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("FOO=first", "FOO=second"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env });
      // Assert
      expect(env.FOO)
        .toEqual("second");
    });

    it(`should let a [section] override a value given above it, for that task only`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults(
          "FOO=base",
          "[release]",
          "FOO=overridden"
        ),
        forRelease: Env = {},
        forTest: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env: forRelease, taskName: "release" });
      await loadDefaults({ defaultsFile, env: forTest, taskName: "test" });
      // Assert
      expect(forRelease.FOO)
        .toEqual("overridden");
      expect(forTest.FOO)
        .toEqual("base");
    });

    it(`should still not override an already-set variable, however many lines mention it`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("FOO=first", "FOO=second"),
        env: Env = { FOO: "from-environment" };
      // Act
      await loadDefaults({ defaultsFile, env });
      // Assert
      expect(env.FOO)
        .toEqual("from-environment");
    });

    it(`should let a later line override a variable which an earlier ! line forced over the environment`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("!FOO=forced", "FOO=later"),
        env: Env = { FOO: "from-environment" };
      // Act
      await loadDefaults({ defaultsFile, env });
      // Assert
      expect(env.FOO)
        .toEqual("later");
    });

    it(`should let a later empty line unset what an earlier line set`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("FOO=first", "FOO="),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env });
      // Assert
      expect(Object.keys(env))
        .not.toContain("FOO");
    });

    it(`should let a later forwarded value override an earlier one`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("FOO=$ONE", "FOO=$TWO"),
        env: Env = { ONE: "1", TWO: "2" };
      // Act
      await loadDefaults({ defaultsFile, env });
      // Assert
      expect(env.FOO)
        .toEqual("2");
    });
  });

  describe(`sections`, () => {
    it(`should apply variables from an explicit [defaults] section regardless of task`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("[defaults]", "FOO=bar"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "anything" });
      // Assert
      expect(env)
        .toEqual({ FOO: "bar" });
    });

    it(`should apply variables from a named section when the task matches`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("[release]", "FOO=bar"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "release" });
      // Assert
      expect(env)
        .toEqual({ FOO: "bar" });
    });

    it(`should not apply variables from a named section when the task does not match`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("[release]", "FOO=bar"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "test" });
      // Assert
      expect(env)
        .toEqual({});
    });

    it(`should never apply a named section when there is no task name`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("[release]", "FOO=bar", "[undefined]", "QUX=quux"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: undefined });
      // Assert
      expect(env)
        .toEqual({});
    });

    it(`should match section names and task names case-insensitively`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("[Release]", "FOO=bar"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "RELEASE" });
      // Assert
      expect(env)
        .toEqual({ FOO: "bar" });
    });

    it(`should support section names with hyphens, as in npm scripts like release-beta`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("[release-beta]", "FOO=beta", "[release]", "FOO=stable"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "release-beta" });
      // Assert
      expect(env.FOO)
        .toEqual("beta");
    });

    it(`should tolerate whitespace and a trailing comment around a section header`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("  [release]   # only when releasing", "FOO=bar"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "release" });
      // Assert
      expect(env)
        .toEqual({ FOO: "bar" });
    });

    it(`should keep applying a section until the next header, and again after [defaults]`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults(
          "A=1",
          "[release]",
          "B=2",
          "[defaults]",
          "C=3"
        ),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "test" });
      // Assert
      expect(env)
        .toEqual({ A: "1", C: "3" });
    });

    it(`should not treat a value containing brackets as a section header`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("PATTERN=[abc]", "OTHER=x[y]"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "test" });
      // Assert
      expect(env)
        .toEqual({ PATTERN: "[abc]", OTHER: "x[y]" });
    });

    it(`should not warn about invalid lines in sections which do not apply`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("[release]", "this is not valid"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "test" });
      // Assert
      expect(warn)
        .not.toHaveBeenCalled();
    });

    it(`should warn about invalid lines in sections which do apply`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("[release]", "this is not valid"),
        env: Env = {};
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "release" });
      // Assert
      expect(warn)
        .toHaveBeenCalledOnce();
    });

    it(`should apply the usual no-override and ! rules inside sections`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("[release]", "KEEP=defaults", "!FORCE=defaults"),
        env: Env = { KEEP: "environment", FORCE: "environment" };
      // Act
      await loadDefaults({ defaultsFile, env, taskName: "release" });
      // Assert
      expect(env)
        .toEqual({ KEEP: "environment", FORCE: "defaults" });
    });
  });

  describe(`forwarding values from other environment variables`, () => {
    it(`should take the value from the named variable when the value starts with $`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("NPM_TOKEN=$MY_TOKEN"),
        env: Env = { MY_TOKEN: "secret" };
      // Act
      await loadDefaults({ defaultsFile, env });
      // Assert
      expect(env.NPM_TOKEN)
        .toEqual("secret");
    });

    it(`should not override an already-set variable with a forwarded value`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("FOO=$BAR"),
        env: Env = { FOO: "already", BAR: "forwarded" };
      // Act
      await loadDefaults({ defaultsFile, env });
      // Assert
      expect(env.FOO)
        .toEqual("already");
    });

    it(`should override an already-set variable with a forwarded value when forced`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("!FOO=$BAR"),
        env: Env = { FOO: "already", BAR: "forwarded" };
      // Act
      await loadDefaults({ defaultsFile, env });
      // Assert
      expect(env.FOO)
        .toEqual("forwarded");
    });

    it(`should treat a forwarded variable which is not set as an empty value (forced: deletes)`, async () => {
      // Arrange
      const
        { defaultsFile } = await createSandboxWithDefaults("!FOO=$MISSING"),
        env: Env = { FOO: "already" };
      // Act
      await loadDefaults({ defaultsFile, env });
      // Assert
      expect(Object.keys(env))
        .not.toContain("FOO");
    });
  });
});
