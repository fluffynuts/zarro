import "expect-even-more-jest";
import * as path from "path";

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

  describe(`the uuid it needs but does not declare`, () => {
    const reason = "gulp-msbuild 0.11.1+ requires uuid without declaring it, so zarro must supply it " +
      "(see .github/dependabot.yml); without it msbuild builds crash for consumers";

    it(`should be a dependency of zarro itself: ${ reason }`, () => {
      // Arrange
      const pkg = require("../../../package.json");
      // Act
      const declared = pkg.dependencies?.uuid;
      // Assert
      expect(declared)
        .toBeString();
    });

    it(`should be resolvable from where gulp-msbuild lives: ${ reason }`, () => {
      // Arrange
      const gulpMsBuildFolder = path.dirname(require.resolve("gulp-msbuild"));
      // Act
      const resolve = () => require.resolve("uuid", { paths: [ gulpMsBuildFolder ] });
      // Assert
      expect(resolve)
        .not.toThrow();
    });
  });
});
