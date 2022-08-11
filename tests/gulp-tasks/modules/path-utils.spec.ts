import "expect-even-more-jest";

describe(`path-utils`, () => {
  describe(`splitPath`, () => {
    const { splitPath } = requireModule<PathUtils>("path-utils");

    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(splitPath)
        .toBeFunction();
      // Assert
    });

    it(`should return the single element`, async () => {
      // Arrange
      const input = "some-path";
      // Act
      const result = splitPath(input);
      // Assert
      expect(result)
        .toEqual([ input ]);
    });

    it(`should split on forward-slash`, async () => {
      // Arrange
      const input = "foo/bar/quux";
      // Act
      const result = splitPath(input);
      // Assert
      expect(result)
        .toEqual([ "foo", "bar", "quux" ]);
    });

    it(`should split on backslash`, async () => {
      // Arrange
      const input = "foo\\bar\\quux";
      // Act
      const result = splitPath(input);
      // Assert
      expect(result)
        .toEqual([ "foo", "bar", "quux" ]);
    });

    it(`should split on a mix`, async () => {
      // Arrange
      const input = "foo/bar\\quux";
      // Act
      const result = splitPath(input);
      // Assert
      expect(result)
        .toEqual([ "foo", "bar", "quux" ]);
    });

    describe(`safe-guarding js calls`, () => {

      it(`should return empty array for null`, async () => {
        // Arrange
        // Act
        const result = splitPath(null as unknown as string);
        // Assert
        expect(result)
          .toBeEmptyArray();
      });

      it(`should return empty array for undefined`, async () => {
        // Arrange
        // Act
        const result = splitPath(undefined as unknown as string);
        // Assert
        expect(result)
          .toBeEmptyArray();
      });

      it(`should return empty array for empty string`, async () => {
        // Arrange
        // Act
        const result = splitPath("");
        // Assert
        expect(result)
          .toBeEmptyArray();
      });
    });
  });

  describe(`baseName`, () => {
    const { baseName } = requireModule<PathUtils>("path-utils");

    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(baseName)
        .toBeFunction();
      // Assert
    });

    it(`should return the single string`, async () => {
      // Arrange
      const input = "file-name";
      // Act
      const result = baseName(input);
      // Assert
      expect(result)
        .toEqual(input);
    });

    it(`should return the last bit of a path with forward-slash`, async () => {
      // Arrange
      var input = "foo/bar/quux";
      // Act
      const result = baseName(input);
      // Assert
      expect(result)
        .toEqual("quux");
    });

    it(`should return the last bit of a path with backslash`, async () => {
      // Arrange
      var input = "foo\\bar\\quux";
      // Act
      const result = baseName(input);
      // Assert
      expect(result)
        .toEqual("quux");
    });

    describe(`safe-guarding js calls`, () => {
      it(`should return empty string for null`, async () => {
        // Arrange
        // Act
        const result = baseName(null as unknown as string);
        // Assert
        expect(result)
          .toBeEmptyString();
      });

      it(`should return empty string for undefined`, async () => {
        // Arrange
        // Act
        const result = baseName(undefined as unknown as string);
        // Assert
        expect(result)
          .toBeEmptyString();
      });

      it(`should return empty string for empty string`, async () => {
        // Arrange
        // Act
        const result = baseName("");
        // Assert
        expect(result)
          .toBeEmptyString();
      });
    });
  });

  describe(`chopExtension`, () => {
    const { chopExtension } = requireModule<PathUtils>("path-utils");

    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(chopExtension)
        .toBeFunction();
      // Assert
    });

    it(`should return the single string when no extension`, async () => {
      // Arrange
      const input = "foo";
      // Act
      const result = chopExtension(input);
      // Assert
      expect(result)
        .toEqual(input);
    });

    it(`should return the entire path when no extension`, async () => {
      // Arrange
      const input = "foo/bar/quux";
      // Act
      const result = chopExtension(input);
      // Assert
      expect(result)
        .toEqual(input);
    });

    it(`should chop the extension off a file name`, async () => {
      // Arrange
      const input = "foo.txt";
      // Act
      const result = chopExtension(input);
      // Assert
      expect(result)
        .toEqual("foo");
    });

    it(`should chop the extension off a path`, async () => {
      // Arrange
      const input = "foo/bar/quux.bat";
      // Act
      const result = chopExtension(input);
      // Assert
      expect(result)
        .toEqual("foo/bar/quux");
    });

    describe(`safe-guarding js calls`, () => {
      it(`should return empty string for null`, async () => {
        // Arrange
        // Act
        const result = chopExtension(null as unknown as string);
        // Assert
        expect(result)
          .toBeEmptyString();
      });

      it(`should return empty string for undefined`, async () => {
        // Arrange
        // Act
        const result = chopExtension(undefined as unknown as string);
        // Assert
        expect(result)
          .toBeEmptyString();
      });

      it(`should return empty string for empty string`, async () => {
        // Arrange
        // Act
        const result = chopExtension("");
        // Assert
        expect(result)
          .toBeEmptyString();
      });
    });
  });
});
