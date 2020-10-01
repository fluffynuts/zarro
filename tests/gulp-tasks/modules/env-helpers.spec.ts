import "expect-even-more-jest";
import faker from "faker";

(function() {
  const {
    env,
    envNumber,
    envFlag
  } = require("../../../gulp-tasks/modules/env-helpers") as EnvHelpers;

  describe(`env-helpers`, () => {
    describe(`env`, () => {
      it(`should have be a function`, async () => {
        // Arrange
        // Act
        expect(env)
          .toBeFunction();
        // Assert
      });
      it(`should return the environment variable, when defined`, async () => {
        // Arrange
        const
          name = faker.random.alphaNumeric(10),
          value = faker.random.alphaNumeric(10);
        process.env[name] = value;
        // Act
        const result = env(name);
        // Assert
        expect(result)
          .toEqual(value);
      });

      it(`should return the fallback when variable is not defined`, async () => {
        // Arrange
        const
          name = faker.random.alphaNumeric(10),
          fallback = faker.random.alphaNumeric(10);
        expect(process.env[name])
          .not.toExist();
        // Act
        const result = env(name, fallback);
        // Assert
        expect(result)
          .toEqual(fallback);
      });

      it(`should throw if the var is not defined and no fallback provided`, async () => {
        // Arrange
        const
          name = faker.random.alphaNumeric(10);
        expect(process.env[name])
          .not.toExist();
        // Act
        expect(() => env(name))
          .toThrow(/not defined and no fallback provided/);
        // Assert
      });

      it(`should return undefined if that is explicitly provided as the fallback`, async () => {
        // Arrange
        const
          name = faker.random.alphaNumeric(10);
        expect(process.env[name])
          .not.toExist();
        // Act
        const result = env(name, undefined);
        // Assert
        expect(result)
          .toBeUndefined();
      });
    });

    describe(`envNumber`, () => {
      it(`should return the numeric env var as a number`, async () => {
        // Arrange
        const
          name = faker.random.alphaNumeric(10),
          expected = faker.random.number();
        process.env[name] = expected.toString();
        // Act
        const result = envNumber(name);
        // Assert
        expect(result)
          .toEqual(expected);
      });

      it(`should return the numeric fall back when the var is not defined`, async () => {
        // Arrange
        const
          name = faker.random.alphaNumeric(10),
          expected = faker.random.number();
        expect(process.env[name])
          .not.toExist();
        // Act
        const result = envNumber(name, expected);
        // Assert
        expect(result)
          .toEqual(expected);
      });

      it(`should throw if the env var is not found and no fallback`, async () => {
        // Arrange
        const
          name = faker.random.alphaNumeric(10);
        expect(process.env[name])
          .not.toExist();
        // Act
        expect(() => envNumber(name))
          .toThrow(/not defined and no fallback provided/);
        // Assert
      });

      it(`should throw if the env var is defined, but not numeric`, async () => {
        // Arrange
        const
          name = faker.random.alphaNumeric(10);
        process.env[name] = faker.random.alphaNumeric(10)
        while (!isNaN(parseInt(process.env[name] || ""))) {
          process.env[name] = faker.random.alphaNumeric(10)
        }
        // Act
        expect(() => envNumber(name))
          .toThrow(/numeric value but found/);
        // Assert
      });
    });

    describe(`envFlag`, () => {
      [
        { value: "1", expected: true },
        { value: "yes", expected: true },
        { value: "yEs", expected: true },
        { value: "true", expected: true },

        { value: "0", expected: false },
        { value: "no", expected: false },
        { value: "false", expected: false },
      ].forEach(testCase => {
        it(`should return the expected value for defined var: ${ testCase.value }`, async () => {
          // Arrange
          const name = faker.random.alphaNumeric(10);
          process.env[name] = testCase.expected.toString();
          // Act
          const result = envFlag(name);
          // Assert
          expect(result)
            .toEqual(testCase.expected);
        });
      });

      it(`should throw for a value that can't be parsed as boolean`, async () => {
        // Arrange
        const
          name = faker.random.alphaNumeric(10),
          value = faker.random.alphaNumeric(10);
        process.env[name] = value;
        // Act
        expect(() => envFlag(name))
          .toThrow(/could not parse/);
        // Assert
      });
    });

  });
})();
