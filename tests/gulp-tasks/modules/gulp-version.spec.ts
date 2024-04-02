import "expect-even-more-jest";
import { readTextFile } from "yafs";

describe(`gulp-version`, () => {
  it(`should return the currently-installed version`, async () => {
    // Arrange
    const
      raw = await readTextFile("node_modules/gulp/package.json"),
      parsed = JSON.parse(raw) as PackageIndex,
      expected = parsed.version;
    // Act
    const result = requireModule<GulpVersion>("gulp-version");
    // Assert
    expect(`${result.major}.${result.minor}.${result.patch}`)
      .toEqual(expected);
  });
});
