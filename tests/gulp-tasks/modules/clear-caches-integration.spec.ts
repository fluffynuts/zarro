import "expect-even-more-jest";

describe(`dotnet-cli:clearCaches (integration)`, () => {
  const { clearCaches } = requireModule<DotNetCli>("dotnet-cli");
  describe(`integration testing - validate that dotnet doesn't explode`, () => {
    it(`should be able to clear http cache`, async () => {
      // clearing the global cache every time I release will get old
      //  quickly - this is just here to ensure that the generated CLI
      //  is correct
      // Arrange
      // Act
      await expect(clearCaches(clearCaches.httpCache))
        .resolves.not.toThrow();
      // Assert
    });
  });
});
