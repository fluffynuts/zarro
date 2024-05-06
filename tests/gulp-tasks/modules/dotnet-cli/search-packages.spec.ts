import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";

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
    let result: PackageInfo[] = [];
    try {
      result = await searchPackages({
        source: "github-codeo",
        search: "Codeo.Core",
        preRelease: true,
        exactMatch: true,
        take: 1
      });
    } catch (e: any) {
      const err = e as Error;
      if (err.message.includes("401 (Unauthorized)")) {
        console.warn("Skipping this test - local nuget config does not allow access to private package repo");
        return;
      }
    }
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

  describe(`finding a well-known package when search results exceed the default limit of 20`, () => {
    const pkg = "PeanutButter.TestUtils.AspNetCore";
    it(`should find the package '${ pkg }'`, async () => {
      // Arrange
      // Act
      const result = await searchPackages({
        search: "PeanutButter",
        exactMatch: false,
        take: 100
      });
      // Assert
      expect(result.find(o => o.id === pkg))
        .toExist();
    });
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

  describe(`working around dotnet cli issues`, () => {
    describe(`when failing to auth to read the package index`, () => {
      describe(`exact search`, () => {
        it(`should throw good error`, async () => {
            // Arrange
            const
              sandbox = await Sandbox.create(),
              privateSource = "https://nuget.pkg.github.com/codeo-za/index.json",
              configFile = await sandbox.writeFile(
                "NuGet.config",
                `
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
    <add key="github" value="${ privateSource }" />
  </packageSources>
  <packageSourceCredentials>
    <github>
      <add key="Username" value="invalid-name" />
      <add key="ClearTextPassword" value="invalid-token" />
    </github>
  </packageSourceCredentials>
</configuration>
`
              );
            // Act
            await expect(searchPackages({
                source: "github",
                configFile,
                exactMatch: true,
                search: "Codeo.Core"
              })
            ).rejects.toThrow(/unhandled exception/i);
            // Assert
          }
        );
      });
      describe(`inexact search`, () => {
        // behaves differently from exact search, of course :|
        it(`should throw good error`, async () => {
            // Arrange
            const
              sandbox = await Sandbox.create(),
              privateSource = "https://nuget.pkg.github.com/codeo-za/index.json",
              configFile = await sandbox.writeFile(
                "NuGet.config",
                `
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
    <add key="github" value="${ privateSource }" />
  </packageSources>
  <packageSourceCredentials>
    <github>
      <add key="Username" value="invalid-name" />
      <add key="ClearTextPassword" value="invalid-token" />
    </github>
  </packageSourceCredentials>
</configuration>
`
              );
            // Act
            await expect(searchPackages({
              source: "github",
              configFile,
              exactMatch: true,
              search: "Codeo.Core"
            })).rejects.toThrow(/unable to perform package search.*check your access token/i);
            // Assert
          }
        );
      });
    });
  });
  afterAll(async () => {
    await Sandbox.destroyAll();
  });
});
