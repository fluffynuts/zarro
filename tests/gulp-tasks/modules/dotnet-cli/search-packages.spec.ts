import "expect-even-more-jest";
import { updateSubModuleTask } from "simple-git/dist/src/lib/tasks/sub-module";

describe(`searchPackages`, () => {
  const {
    searchPackages,
    listNugetSources
  } = requireModule<DotNetCli>("dotnet-cli");
  it(`should be a function`, async () => {
    // Arrange
    // Act
    expect(searchPackages)
      .toBeAsyncFunction();
    // Assert
  });

  it(`should find NExpect at nuget.org (1)`, async () => {
    // Arrange
    // Act
    const result = await searchPackages("NExpect");
    // Assert
    expect(result)
      .not.toBeEmptyArray();
    const latest = result.find(o => o.id == "NExpect")
    if (!latest) {
      throw new Error(`Can't find NExpect package in results\n${
        result
          .map(o => `${ o.id }: ${ o.version }`)
          .join("\n")
      }`)
    }
    expect(latest.version.isGreaterThan("2.0.88"))
      .toBeTrue();
  });

  it(`should find packages at github`, async () => {
    // Arrange
    const availableSources = await listNugetSources();
    const githubSource = availableSources.find(
      o => o.name == "github-codeo"
    );
    if (!githubSource) {
      console.warn(`Unable to test github access: no local source with the name 'github-codeo'`);
      return;
    }
    // Act
    const result = await searchPackages({
      source: "github-codeo",
      search: "Codeo.Core",
      preRelease: true,
      exactMatch: true,
      take: 1
    });
    // Assert
    expect(result.length)
      .toEqual(1);
  });

  it(`should not include pre-release packages by default`, async () => {
    // Arrange
    // Act
    const result = await searchPackages({
      search: "NExpect",
      exactMatch: true
    });
    // Assert
    const firstPreRelease = result.find(
      o => o.version.isPreRelease
    );
    expect(firstPreRelease)
      .not.toExist();
  });

  it(`should find pre-release packages on request`, async () => {
    // Arrange
    // Act
    const result = await searchPackages({
      search: "NExpect",
      preRelease: true,
      exactMatch: true
    });
    // Assert
    const firstPreRelease = result.find(
      o => o.version.isPreRelease
    );
    expect(firstPreRelease)
      .toExist();
  });

  describe(`paging`, () => {
    it(`should page on request`, async () => {
      // Arrange
      const opts = {
        search: "NExpect",
        exactMatch: true
      }
      // Act
      const allResults = await searchPackages(opts);
      const result1 = await searchPackages({
        ...opts,
        take: 1,
        skip: 0
      });
      const result2 = await searchPackages({
        ...opts,
        take: 1,
        skip: 1
      });
      // Assert
      expect(result1[0])
        .toEqual(allResults[0]);
      expect(result2[0])
        .toEqual(allResults[1]);
    });
  });
});
