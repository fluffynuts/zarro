import "expect-even-more-jest";
const sut = requireModule<ResolveMasks>("resolve-masks");

describe(`resolve-masks`, () => {
  it(`should leave out the undefined env var`, async () => {
    // Arrange
    process.env["MOO_INCLUDE"] = "moo";
    expect(process.env["MOO_EXCLUDE"])
      .not.toBeDefined();
    // Act
    const result = sut("MOO_INCLUDE" as StringEnvVar, ["MOO_EXCLUDE" as StringEnvVar]);
    // Assert
    expect(result.find(s => s.match(/undefined/)))
      .not.toExist();
  });
});
