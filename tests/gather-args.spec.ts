import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
const sut = require("../index-modules/gather-args");
const faker = require("faker");

describe(`gather-args`, () => {
  it(`should gather no args when there are none`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      fileName = faker.random.alphaNumeric(4) + ".js",
      entryFile = await sandbox.writeFile(fileName, [
        "#!/bin/env node",
        "console.log('started');"
      ].join("\n")),
      argv = [ "node", "foo", entryFile ],
      expected: string[] = [ ];
    // Act
    const result = await sut(entryFile, argv);
    // Assert
    expect(result).toEqual(expected);
  });
  it(`should return all args after the invoking file`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      fileName = faker.random.alphaNumeric(4) + ".js",
      entryFile = await sandbox.writeFile(fileName, [
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
