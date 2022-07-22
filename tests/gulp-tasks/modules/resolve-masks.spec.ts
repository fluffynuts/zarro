import "expect-even-more-jest";
const sut = requireModule<ResolveMasks>("resolve-masks");

describe(`resolve-masks`, () => {
  it(`should leave out the undefined env var`, async () => {
    // Arrange
    process.env["MOO_INCLUDE"] = "moo";
    expect(process.env["MOO_EXCLUDE"])
      .not.toBeDefined();
    // Act
    const result = sut("MOO_INCLUDE", ["MOO_EXCLUDE"]);
    // Assert
    console.log(result);
    expect(result.find(s => s.match(/undefined/)))
      .not.toExist();
  });
});
