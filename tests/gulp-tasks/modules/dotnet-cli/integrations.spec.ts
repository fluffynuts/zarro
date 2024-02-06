// noinspection ES6ConvertRequireIntoImport
import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { withLockedNuget } from "../../../test-helpers/run-locked";
import { Sandbox } from "filesystem-sandbox";
const {
  anything,
  mockSystem,
  system,
  enableSystemCallThrough,
  disableSystemCallThrough,
  mockUpdatePackageNuspec,
  runWithRealSystem
} = require("./common");
import { v4 } from "uuid";

describe("dotnet-cli", () => {
  const sut = requireModule<DotNetCli>("dotnet-cli");
  let allowLogs = false;
  beforeEach(() => {
    allowLogs = false;
    mockSystem();
    mockUpdatePackageNuspec();
    disableSystemCallThrough();
    const original = console.log;
    spyOn(console, "log").and.callFake((...args: any[]) => {
      if (!allowLogs) {
        return;
      }
      original.apply(console, args);
    });
  });
  afterEach(async () => {
    await Sandbox.destroyAll();
  })
  describe(`nuget operations`, () => {
    beforeEach(() => {
      disableSystemCallThrough();
    });

    describe(`listNugetSources`, () => {
      /*
        mocked 'dotnet nuget list sources' output is:
              "  1.  nuget.org [Enabled]",
              "      https://api.nuget.org/v3/index.json",
              "  2.  custom [Enabled]",
              "      https://nuget.custom-domain.com/nuget",
              "  3.  Microsoft Visual Studio Offline Packages [Disabled]",
              "      C:\\Program Files (x86)\\Microsoft SDKs\\NuGetPackages\\"
       */
      const { listNugetSources } = sut;
      it(`should return all the nuget sources`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const expected = [ {
            name: "nuget.org",
            url: "https://api.nuget.org/v3/index.json",
            enabled: true
          }, {
            name: "custom",
            url: "https://nuget.custom-domain.com/nuget",
            enabled: true
          }, {
            name: "Microsoft Visual Studio Offline Packages",
            url: "C:\\Program Files (x86)\\Microsoft SDKs\\NuGetPackages\\",
            enabled: false
          } ] satisfies NugetSource[];
          // Act
          const result = await listNugetSources();
          // Assert
          expect(result)
            .toEqual(expected);
        });
      });
    });

    describe(`addNugetSource`, () => {
      const { addNugetSource } = sut;
      it(`should set auth on request`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
            username: faker.string.alphanumeric(5),
            password: faker.string.alphanumeric(5),
          } satisfies NugetAddSourceOptions;
          // Act
          await addNugetSource(src);
          // Assert
          expect(system)
            .toHaveBeenCalledWith(
              "dotnet",
              [ "nuget", "add", "source",
                "--name", src.name,
                "--username", src.username,
                "--password", src.password,
                src.url
              ], anything
            );
        });
      });

      it(`should request clearText passwords on request`, async () => {
        // Arrange
        await withLockedNuget(async () => {
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
            username: faker.string.alphanumeric(5),
            password: faker.string.alphanumeric(5),
            storePasswordInClearText: true
          } satisfies NugetAddSourceOptions;
          // Act
          await addNugetSource(src);
          // Assert
          expect(system)
            .toHaveBeenCalledWith(
              "dotnet",
              [ "nuget", "add", "source",
                "--name", src.name,
                "--username", src.username,
                "--password", src.password,
                "--store-password-in-clear-text",
                src.url
              ], anything
            );
        });
      });

      it(`should pass through valid auth types when set`, async () => {
        // Arrange
        await withLockedNuget(async () => {
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
            username: faker.string.alphanumeric(5),
            password: faker.string.alphanumeric(5),
            validAuthenticationTypes: "foo,bar"
          } satisfies NugetAddSourceOptions;
          // Act
          await addNugetSource(src);
          // Assert
          expect(system)
            .toHaveBeenCalledWith(
              "dotnet",
              [ "nuget", "add", "source",
                "--name", src.name,
                "--username", src.username,
                "--password", src.password,
                "--valid-authentication-types", src.validAuthenticationTypes,
                src.url
              ], anything
            );
        });
      });

      it(`should pass through config file path when set`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
            username: faker.string.alphanumeric(5),
            password: faker.string.alphanumeric(5),
            configFile: faker.string.alphanumeric(10)
          } satisfies NugetAddSourceOptions;
          // Act
          await addNugetSource(src);
          // Assert
          expect(system)
            .toHaveBeenCalledWith(
              "dotnet",
              [ "nuget", "add", "source",
                "--name", src.name,
                "--username", src.username,
                "--password", src.password,
                "--configfile", src.configFile,
                src.url
              ], anything
            );
        });
      });
    });

    describe(`addNugetSource / removeNugetSource`, () => {
      beforeEach(() => {
        mockSystem();
        enableSystemCallThrough();
      });
      const {
        addNugetSource,
        listNugetSources,
        removeNugetSource
      } = sut;

      it(`should be able to add and remove the source (by name)`, async () => {
        // Arrange
        await withLockedNuget(async () => {
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
          } satisfies NugetAddSourceOptions;
          // Act
          await addNugetSource(src);
          let configuredSources = await listNugetSources();
          expect(configuredSources.find(
            (o: any) => o.name === src.name && o.url === src.url))
            .toExist();
          await removeNugetSource(src.name);
          // Assert
          configuredSources = await listNugetSources();
          expect(configuredSources.find(
            (o: any) => o.name === src.name && o.url === src.url))
            .not.toExist();
        });
      });

      it(`should be able to add disabled source`, async () => {
        // Arrange
        await withLockedNuget(async () => {
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
            enabled: false
          } satisfies NugetAddSourceOptions;
          // Act
          await addNugetSource(src);
          // Assert
          let configuredSources = await listNugetSources();
          const match = configuredSources.find(
            (o: any) => o.name === src.name && o.url === src.url
          );
          expect(match)
            .toExist();
          expect(match?.enabled)
            .toBeFalse();
        });
      });

      it(`should be able to remove source by url`, async () => {
        // Arrange
        await withLockedNuget(async () => {
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
          } satisfies NugetAddSourceOptions;
          // Act
          await addNugetSource(src);
          let configuredSources = await listNugetSources();
          expect(configuredSources.find(
            (o: any) => o.name === src.name && o.url === src.url))
            .toExist();
          await removeNugetSource(src.url);
          // Assert
          configuredSources = await listNugetSources();
          expect(configuredSources.find(
            (o: any) => o.name === src.name && o.url === src.url))
            .not.toExist();
        });
      });

      it(`should be able to remove source by host`, async () => {
        // Arrange
        await withLockedNuget(async () => {
          const src = {
              name: randomSourceName(),
              url: faker.internet.url(),
            } satisfies NugetAddSourceOptions,
            url = new URL(src.url);
          // Act
          await addNugetSource(src);
          let configuredSources = await listNugetSources();
          expect(configuredSources.find(o => o.name === src.name && o.url === src.url))
            .toExist();
          await removeNugetSource(url.host);
          // Assert
          configuredSources = await listNugetSources();
          expect(configuredSources.find(o => o.name === src.name && o.url === src.url))
            .not.toExist();
        });
      });

      it(`should refuse to remove if more than one source matched`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const
            url1 = "https://nuget.pkg.github.com/projectA/index.json",
            url2 = "https://nuget.pkg.github.com/projectB/index.json",
            src1 = {
              name: randomSourceName(),
              url: url1,
            } satisfies NugetAddSourceOptions,
            src2 = {
              name: randomSourceName(),
              url: url2
            }
          // Act
          await addNugetSource(src1);
          await addNugetSource(src2);
          await expect(
            removeNugetSource("nuget.pkg.github.com")
          ).rejects.toThrow(/multiple/);
          // Assert
        });
      });
    });

    describe(`disableNuGetSource`, () => {
      const {
        addNugetSource,
        disableNugetSource
      } = sut;
      beforeEach(() => enableSystemCallThrough());
      it(`should disable the disabled source by name`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
            enabled: false
          } satisfies NugetSource;
          await addNugetSource(src);
          // Act
          await disableNugetSource(src.name);
          // Assert
          const result = (await listNugetSources())
            .find(o => o.name === src.name);
          expect(result)
            .toExist();
          expect(result?.enabled)
            .toBeFalse();
        });
      });

      it(`should disable the disabled source by url`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
            enabled: false
          } satisfies NugetSource;
          await addNugetSource(src);
          // Act
          await disableNugetSource(src.url);
          // Assert
          const result = (await listNugetSources())
            .find(o => o.name === src.name);
          expect(result)
            .toExist();
          expect(result?.enabled)
            .toBeFalse();
        });
      });

      it(`should disable the disabled source by full source`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
            enabled: false
          } satisfies NugetSource;
          await addNugetSource(src);
          // Act
          await disableNugetSource(src);
          // Assert
          const result = (await listNugetSources())
            .find(o => o.name === src.name);
          expect(result)
            .toExist();
          expect(result?.enabled)
            .toBeFalse();
        });
      });
    });

    describe(`tryFindConfiguredNugetSource`, () => {
      beforeEach(() => {
        enableSystemCallThrough();
      });
      const {
        addNugetSource,
        tryFindConfiguredNugetSource
      } = sut;
      it(`should find the source by name`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
            enabled: true
          };
          // Act
          await addNugetSource(src);
          const result = await tryFindConfiguredNugetSource(src.name);
          // Assert
          expect(result)
            .toEqual(src);
        });
      });

      it(`should find the source by host`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const src = {
              name: randomSourceName(),
              url: faker.internet.url(),
              enabled: true
            },
            url = new URL(src.url),
            host = url.host;
          // Act
          await addNugetSource(src);
          const result = await tryFindConfiguredNugetSource(host);
          // Assert
          expect(result)
            .toEqual(src);
        });
      });

      it(`should find the source by url`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const src = {
            name: randomSourceName(),
            url: faker.internet.url(),
            enabled: true
          };
          // Act
          await addNugetSource(src);
          const result = await tryFindConfiguredNugetSource(src.url);
          // Assert
          expect(result)
            .toEqual(src);
        });
      });

      it(`should return undefined when no match`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          // Act
          const result = await tryFindConfiguredNugetSource(
            faker.internet.url()
          )
          // Assert
          expect(result)
            .not.toBeDefined();
        });
      });

      it(`should return single partial url match`, async () => {
        await withLockedNuget(async () => {
          // Arrange
          const src = {
            name: randomSourceName(),
            url: `https://nuget.pkg.github.com/organisation/index.json`,
            enabled: true
          };
          // Act
          await addNugetSource(src);
          const result = await tryFindConfiguredNugetSource(
            /nuget.pkg.github.com\/organisation/
          );
          // Assert
          expect(result)
            .toEqual(src);
        });
      });
    });

    describe.skip(`clear extraneous sources`, () => {
      beforeEach(() => {
        enableSystemCallThrough();
      });
      const { removeNugetSource } = sut;
      // if you're trying to clean up some massive source noise, modify the array
      // below and run the test
      const keep = new Set([
        "nuget.org",
        "github-codeo",
        "github-fluffynuts",
        "codeo",
        "Microsoft Visual Studio Offline Packages"
      ]);
      it(`should keep only the keepers`, async () => {
        // Arrange
        bypassNugetSourceRestore = true;
        const sources = await listNugetSources();
        // Act
        const kept = [] as string[],
          chucked = [] as string[];
        for (const source of sources) {
          if (keep.has(source.name)) {
            kept.push(source.name);
          } else {
            chucked.push(source.name);
          }
        }
        for (const source of chucked) {
          await removeNugetSource(source);
        }
        console.warn(`
kept:
  ${ kept.join("\n  ") }
chucked:
  ${ chucked.join("\n  ") }
  `.trim());
        // Assert
      });
    });
  });

  describe(`specific integrations`, () => {
    describe(`incrementTempDbPortHintIfFound`, () => {
      const { incrementTempDbPortHintIfFound } = requireModule<DotNetCli>("dotnet-cli");
      describe(`when found`, () => {
        it(`should increment TEMPDB_PORT_HINT`, async () => {
          // Arrange

          const
            start = faker.number.int({ min: 1024, max: 32768 }),
            env = { TEMPDB_PORT_HINT: `${start}` };
          // Act
          incrementTempDbPortHintIfFound(env);
          const first = env["TEMPDB_PORT_HINT"];
          incrementTempDbPortHintIfFound(env);
          const second = env["TEMPDB_PORT_HINT"];
          // Assert
          expect(parseInt(first))
            .toEqual(start);
          expect(parseInt(second))
            .toEqual(start + 1);
        });
      });
    });
  });

  beforeEach(() => {
    allowLogs = false;
    const original = console.log;
    spyOn(console, "log").and.callFake((...args: any[]) => {
      if (!allowLogs) {
        return;
      }
      original.apply(console, args);
    });
    mockSystem();
    enableSystemCallThrough();
    mockUpdatePackageNuspec();
  });

  beforeAll(async () => {
    usedSourceNames.clear();
    mockSystem();
    disableSystemCallThrough();
    await storeAllKnownNugetSources();
  });

  afterAll(async () => {
    await restoreAllKnownNugetSources();
  });
  const usedSourceNames = new Set<string>();

  let idx = 1;
  function randomSourceName() {
    return `test-source-${idx++}-${v4()}`;
  }

  const knownSources = [] as NugetSource[];

  const { listNugetSources } = sut;

  async function storeAllKnownNugetSources() {
    bypassNugetSourceRestore = false;
    await runWithRealSystem(async () => {
      const sources = await listNugetSources();
      knownSources.push(...sources);
    });
  }

  let bypassNugetSourceRestore = false;

  async function restoreAllKnownNugetSources() {
    if (bypassNugetSourceRestore) {
      return;
    }
    await runWithRealSystem(async () => {
      const
        toRestore = knownSources.splice(0, knownSources.length),
        currentSources = await listNugetSources(),
        toRemove = [] as NugetSource[],
        toDisable = [] as NugetSource[],
        toAdd = [] as NugetSource[],
        toEnable = [] as NugetSource[];
      for (const source of toRestore) {
        const match = currentSources.find(
          o => o.name === source.name && o.url === source.url
        );
        if (match) {
          if (match.enabled === source.enabled) {
            continue;
          }
          if (source.enabled) {
            toEnable.push(source);
          } else {
            toDisable.push(source);
          }
        } else {
          toAdd.push(source);
        }
      }

      for (const source of currentSources) {
        const match = toRestore.find(
          o => o.name === source.name && o.url === source.url
        );
        if (match) {
          if (match.enabled === source.enabled) {
            continue;
          }
          if (source.enabled) {
            toDisable.push(source);
          } else {
            toEnable.push(source);
          }
        } else {
          toRemove.push(source);
        }
      }

      await addNugetSources(toAdd);
      await removeNugetSources(toRemove);
      await enableNugetSources(toEnable);
      await disableNugetSources(toDisable);
    });
  }

  async function addNugetSources(
    toAdd: NugetSource[]
  ): Promise<void> {
    const { addNugetSource } = sut;
    await runOnSources(
      toAdd,
      addNugetSource
    );
  }

  async function removeNugetSources(
    toRemove: NugetSource[]
  ): Promise<void> {
    const { removeNugetSource } = sut;
    await runOnSources(
      toRemove,
      removeNugetSource
    );
  }

  async function enableNugetSources(
    toEnable: NugetSource[]
  ): Promise<void> {
    const { enableNugetSource } = sut;
    await runOnSources(
      toEnable,
      enableNugetSource
    );
  }

  async function disableNugetSources(
    toDisable: NugetSource[]
  ): Promise<void> {
    const { disableNugetSource } = sut;
    await runOnSources(
      toDisable,
      disableNugetSource
    );
  }

  async function runOnSources(
    sources: NugetSource[],
    fn: (o: NugetSource) => Promise<void>
  ) {
    for (const source of sources) {
      await fn(source);
    }
  }

});
