// noinspection ES6ConvertRequireIntoImport
import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { withLockedNuget } from "../../../test-helpers/run-locked";
import { Sandbox } from "filesystem-sandbox";
import { shouldSkipSlowNetworkTests } from "../../../test-helpers/should-skip-slow-network-tests";

const {
  anything,
  mockSystem,
  system,
  enableSystemCallThrough,
  disableSystemCallThrough,
  mockUpdatePackageNuspec,
  runWithRealSystem
} = require("./common");

if (shouldSkipSlowNetworkTests()) {
  describe(`dotnet-cli`, () => {
    it(`skipping tests`, async () => {
      // Arrange
      // Act
      expect(true).toBeTrue();
      // Assert
    });
  });
} else {
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

    });

    describe(`specific integrations`, () => {
      describe(`incrementTempDbPortHintIfFound`, () => {
        const { incrementTempDbPortHintIfFound } = requireModule<DotNetCli>("dotnet-cli");
        describe(`when found`, () => {
          it(`should increment TEMPDB_PORT_HINT`, async () => {
            // Arrange

            const
              start = faker.number.int({
                min: 1024,
                max: 32768
              }),
              env = { TEMPDB_PORT_HINT: `${ start }` };
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
    });

    afterEach(async () => {
      await removeTestNugetSources();
    });
    const usedSourceNames = new Set<string>();

    const testSourcePrefix = "test-source-";
    function randomSourceName() {
      let result: string;
      do {
        result = `${testSourcePrefix}${ faker.word.sample() }-${ faker.word.sample() }`;
      } while (usedSourceNames.has(result));
      usedSourceNames.add(result);
      return result;
    }

    const knownSources = [] as NugetSource[];

    const { listNugetSources } = sut;

    async function removeTestNugetSources() {
      await runWithRealSystem(async () => {
        const currentSources = await sut.listNugetSources();
        for (const source of currentSources) {
          if (source.name.indexOf(testSourcePrefix) === 0) {
            await sut.removeNugetSource(source);
          }
        }
      });
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
}
