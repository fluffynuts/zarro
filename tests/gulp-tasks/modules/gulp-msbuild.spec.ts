import "expect-even-more-jest";

describe(`gulp-msbuild wrapper`, () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it(`should not load gulp-msbuild until it is used`, () => {
    // Arrange
    const loaded = jest.fn();
    jest.doMock("gulp-msbuild", () => {
      loaded();
      return jest.fn();
    });
    // Act
    requireModule<GulpMsBuild>("gulp-msbuild");
    // Assert
    expect(loaded).not.toHaveBeenCalled();
  });

  it(`should call through to gulp-msbuild when used`, () => {
    // Arrange
    const
      stream = {},
      real = jest.fn().mockReturnValue(stream),
      opts = { targets: [ "Build" ] };
    jest.doMock("gulp-msbuild", () => real);
    const sut = requireModule<GulpMsBuild>("gulp-msbuild");
    // Act
    const result = sut(opts);
    // Assert
    expect(real).toHaveBeenCalledOnceWith(opts);
    expect(result).toBe(stream);
  });
});
