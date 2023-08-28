import "expect-even-more-jest";
import { folderExists, mkdir, readTextFile } from "yafs";
import { faker } from "@faker-js/faker";
import { Sandbox } from "filesystem-sandbox";

describe(`create-temp-file`, () => {
  const
    createTempFile = requireModule<CreateTempFile>("create-temp-file"),
    os = require("os"),
    isWindows = os.platform() === "win32",
    tempDir = isWindows
      ? resolveFirstEnvVarFolder("TEMP", "TMP")
      : "/tmp";

  describe(`when no contents provided`, () => {
    it(`should create a temporary file with no contents`, async () => {
      // Arrange
      // Act
      const sut = await create();
      // Assert
      expect(sut.path)
        .toBeFile();
      const contents = await readTextFile(sut.path);
      expect(contents)
        .toBeEmptyString();
      sut.destroy();
      expect(sut.path)
        .not.toBeFile();
    });
  });

  describe(`when contents provided`, () => {
    it(`should create the temp file with contents`, async () => {
      // Arrange
      // Act
      const
        expected = faker.word.words(),
        sut = await create(expected);
      // Assert
      expect(sut.path)
        .toBeFile();
      const contents = await readTextFile(sut.path);
      expect(contents)
        .toEqual(expected);
      sut.destroy();
      expect(sut.path)
        .not.toBeFile();
    });
  });

  describe(`when target folder is provided`, () => {
    it(`should use it`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        expected = faker.word.words(),
        target = sandbox.fullPathFor(faker.word.sample()),
        sut = await create(expected, target);
      // Act
      expect(sut.path)
        .toBeFile();
      expect(sut.path)
        .toEqual(target);
      const contents = await readTextFile(sut.path);
      expect(contents)
        .toEqual(expected);
      sut.destroy();
      expect(sut.path)
        .not.toBeFile();
      // Assert
    });
    afterEach(async () => {
      await Sandbox.destroyAll();
    });
  });

  async function create(
    contents?: string | Buffer,
    at?: string
  ): Promise<TempFile> {
    return createTempFile(
      contents,
      at
    );
  }

  async function resolveFirstEnvVarFolder(...vars: string[]): Promise<string> {
    const
      firstDefined = vars.reduce((acc: Optional<string>, cur: string) => {
        if (acc) {
          return acc;
        }
        if (!!process.env[cur]) {
          return process.env[cur];
        }
        return undefined;
      }, undefined);
    if (!firstDefined) {
      throw new Error(`Can't find defined env var amongst: '${ vars }'`);
    }
    if (!await folderExists(firstDefined)) {
      await mkdir(firstDefined);
    }
    return firstDefined;
  }
});
