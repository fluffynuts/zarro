const sut = require("../index-modules/gather-args");
const Sandbox = require("./helpers/sandbox");
const faker = require("faker");

describe(`gather-args`, () => {
  it(`should gather no args when there are none`, async () => {
    // Arrange
    const
      sandbox = Sandbox.create(),
      fileName = faker.random.alphaNumeric(4) + ".js",
      entryFile = await sandbox.writeTextFile(fileName, [
        "#!/bin/env node",
        "console.log('started');"
      ]),
      argv = [ "node", "foo", entryFile ],
      expected = [ ];
    // Act
    const result = await sut(entryFile, argv);
    // Assert
    expect(result).toEqual(expected);
  });
  it(`should return all args after the invoking file`, async () => {
    // Arrange
    const
      sandbox = Sandbox.create(),
      fileName = faker.random.alphaNumeric(4) + ".js",
      entryFile = await sandbox.writeTextFile(fileName, [
        "#!/bin/env node",
        "console.log('started');"
      ]),
      argv = [ "node", "foo", entryFile, "arg1", "arg2" ],
      expected = [ "arg1", "arg2" ];
    // Act
    const result = await sut(entryFile, argv);
    // Assert
    expect(result).toEqual(expected);
  });

  afterAll(async () => {
    await Sandbox.destroyAll();
  });
});
