import "expect-even-more-jest";
import { faker } from "@faker-js/faker";

describe(`temporary-environment`, () => {
  const { withEnvironment } = requireModule<TemporaryEnvironment>("temporary-environment");
  it(`should set the provided variables`, async () => {
    // Arrange
    const
      captured = {} as Dictionary<string | undefined>,
      var1 = faker.string.alphanumeric(10),
      value1 = faker.string.alphanumeric(10),
      var2 = faker.string.alphanumeric(10),
      value2 = faker.string.alphanumeric(10);
    // Act
    await withEnvironment({
      [var1]: value1,
      [var2]: value2
    }).run(() => {
      captured[var1] = process.env[var1];
      captured[var2] = process.env[var2];
    });
    // Assert
    expect(captured[var1])
      .toEqual(value1);
    expect(captured[var2])
      .toEqual(value2);
  });

  it(`should reset the prior variables`, async () => {
    // Arrange
    const
      captured = {} as Dictionary<string | undefined>,
      var1 = faker.string.alphanumeric(10),
      value1 = faker.string.alphanumeric(10),
      value1Original = faker.string.alphanumeric(10),
      var2 = faker.string.alphanumeric(10),
      value2 = faker.string.alphanumeric(10),
      value2Original = faker.string.alphanumeric(10);
    // Act
    process.env[var1] = value1Original;
    process.env[var2] = value2Original;
    await withEnvironment({
      [var1]: value1,
      [var2]: value2
    }).run(() => {
      captured[var1] = process.env[var1];
      captured[var2] = process.env[var2];
    });
    // Assert
    expect(captured[var1])
      .toEqual(value1);
    expect(captured[var2])
      .toEqual(value2);
    expect(process.env[var1])
      .toEqual(value1Original);
    expect(process.env[var2])
      .toEqual(value2Original);
  });

  it(`should knock out the existing environment on request`, async () => {
    // Arrange
    const
      captured = {} as Dictionary<string | undefined>,
      var1 = faker.string.alphanumeric(10),
      value1 = faker.string.alphanumeric(10),
      var2 = faker.string.alphanumeric(10),
      value2 = faker.string.alphanumeric(10);
    // Act
    process.env[var1] = value1;
    await withEnvironment({
        [var2]: value2,
      }, true
    ).run(() => {
      captured[var1] = process.env[var1];
      captured[var2] = process.env[var2];
    });
    // Assert
    expect(captured[var1])
      .not.toBeDefined();
  });
});
