import "expect-even-more-jest";

describe(`git-sha`, () => {
  const {
    init,
    currentShortSHA
  } = requireModule<GitSha>("git-sha");

  describe(`synchronous operations with prior init call`, () => {
    beforeAll(async () => {
      await init();
    });

    it(`should have a synchronous operation to retrieve short sha after init`, async () => {
      // Arrange
      // Act
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const result = currentShortSHA();
      // Assert
      expect(result)
        .not.toBeEmptyString();
    });
  });
});
