import "expect-even-more-jest";

describe(`fetch`, () => {
    const fetch = requireModule<Fetch>("fetch");
    it(`should export a function`, async () => {
        // Arrange
        // Act
        expect(fetch)
            .toBeFunction();
        // Assert
    });

    it(`should be able to fetch from google.com`, async () => {
        // Arrange
        // Act
        const res = await fetch("https://www.google.com");
        const body = await res.text();
        // Assert
        expect(body.toLowerCase())
            .toContain("html");
    });
});
