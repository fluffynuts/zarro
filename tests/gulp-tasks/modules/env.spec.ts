import "expect-even-more-jest";

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
  });
});
