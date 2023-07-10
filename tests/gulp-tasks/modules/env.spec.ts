import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { Sandbox } from "filesystem-sandbox";

describe(`env`, () => {
  const env = requireModule<Env>("env");
  describe(`resolveArray`, () => {
    it(`should resolve undefined var to []`, async () => {
      // Arrange
      const name = "moo_cakes";
      delete process.env[name];
      // Act
      const result = env.resolveArray(name as StringEnvVar);
      // Assert
      expect(result)
        .toEqual([]);
    });
    it(`should resolve the comma-delimited array`, async () => {
      // Arrange
      const
        values = [ faker.word.sample(), faker.word.sample(), faker.word.sample() ],
        key = faker.string.sample(10),
        envVar = values.join(",");
      // Act
      process.env[key] = envVar;
      const result = env.resolveArray(key as AnyEnvVar);
      // Assert
      expect(result)
        .toEqual(values);
    });
    it(`should resolve the array with custom delimiter`, async () => {
      // Arrange
      const
        values = [ faker.word.sample(), faker.word.sample(), faker.word.sample() ],
        key = faker.string.sample(10),
        delimiter = faker.helpers.arrayElement([ ";", ":", "/" ]),
        envVar = values.join(delimiter);
      // Act
      process.env[key] = envVar;
      const result = env.resolveArray(key as AnyEnvVar, delimiter);
      // Assert
      expect(result)
        .toEqual(values);
    });
  });
  describe(`resolveMap`, () => {
    it(`should resolve empty var to empty object`, async () => {
      // Arrange
      const key = faker.string.sample(10);
      // Act
      delete process.env[key];
      const result = env.resolveMap(key as AnyEnvVar);
      // Assert
      expect(result)
        .toEqual({});
    });
    it(`should resolve comma-delimited pairs`, async () => {
      // Arrange
      const
        expected = {
          foo: faker.word.sample(),
          bar: faker.word.sample()
        },
        key = faker.string.sample(10),
        envVar = `foo=${expected.foo},bar=${expected.bar}`;
      // Act
      process.env[key] = envVar;
      const result = env.resolveMap(key as AnyEnvVar);
      // Assert
      expect(result)
        .toEqual(expected);
    });
    it(`should resolve a JSON var`, async () => {
      // Arrange
      const
        expected = {
          foo: faker.word.sample(),
          bar: faker.word.sample()
        },
        key = faker.string.sample(10),
        envVar = JSON.stringify(expected);
      // Act
      process.env[key] = envVar;
      const result = env.resolveMap(key as AnyEnvVar);
      // Assert
      expect(result)
        .toEqual(expected);
    });
    it(`should resolve JSON from a file, if present & enabled`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        expected = {
          foo: faker.word.sample(),
          bar: faker.word.sample()
        },
        key = faker.string.alphanumeric(10);
      await sandbox.writeFile(key, JSON.stringify(expected));
      // Act
      delete process.env[key];
      const result = await sandbox.run(() => env.resolveMap(key as AnyEnvVar));
      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should resolve simple values from file too`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        expected = faker.word.sample(),
        key = faker.string.alphanumeric(10);
      await sandbox.writeFile(key, expected);
      // Act
      delete process.env[key];
      const result = await sandbox.run(() => env.resolve(key as StringEnvVar));
      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should resolve simple values from file with extra newline too`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        expected = faker.word.sample(),
        key = faker.string.alphanumeric(10);
      await sandbox.writeFile(key, `${expected}\n`);
      // Act
      delete process.env[key];
      const result = await sandbox.run(() => env.resolve(key as StringEnvVar));
      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should resolve the default value when the env var is not set`, async () => {
      // Arrange
      const
        key = faker.word.sample();
      env.register({
        name: key as FlagEnvVar,
        help: "some help",
        default: "true"
      });
      // Act
      delete process.env[key];
      const result = env.resolveFlag(key as FlagEnvVar);
      // Assert
      expect(result)
        .toBeTrue();
    });

    it(`should resolve the default value when the env var is not set (2)`, async () => {
      // Arrange
      // Act
      const result = env.resolveFlag("INITIAL_RELEASE");
      // Assert
      expect(result)
        .toBeFalse();
    });

    afterEach(async () => {
      await Sandbox.destroyAll();
    });
  });
});
