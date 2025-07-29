"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
describe(`resolve-nuget-api-key`, () => {
    const resolveNugetApiKey = requireModule("resolve-nuget-api-key"), dotnetCli = require("dotnet-cli"), which = requireModule("which"), env = requireModule("env");
    async function findRandomKnownNugetSource() {
        const all = await dotnetCli.listNugetSources();
        return faker_1.faker.helpers.arrayElement(all);
    }
    beforeAll(() => {
        // zarro's `which` facade caches, and somewhere
        // later in this test, the PATH variable gets smashed ):
        // so if we just ask where dotnet is right now, we can
        // easily see that this is not the problem you're looking
        // for *waves hand like a jedi*
        const dotnet = which("dotnet");
        expect(dotnet)
            .toBeDefined();
    });
    describe(`when NUGET_API_KEY not set and NUGET_API_KEYS not set`, () => {
        it(`should return undefined`, async () => {
            // Arrange
            blockEnvVars(env.NUGET_API_KEY, env.NUGET_API_KEYS);
            expect(env.resolveObject(env.NUGET_API_KEYS))
                .toBeUndefined();
            // Act
            const result = await resolveNugetApiKey();
            // Assert
            expect(result)
                .not.toBeDefined();
        });
    });
    describe(`when only NUGET_API_KEY set`, () => {
        it(`should return that for unnamed source`, async () => {
            // Arrange
            blockEnvVars(env.NUGET_API_KEYS, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
            const expected = faker_1.faker.string.alphanumeric(32);
            process.env.NUGET_API_KEY = expected;
            // Act
            const result = await resolveNugetApiKey();
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should return that for a named source`, async () => {
            // Arrange
            blockEnvVars(env.NUGET_API_KEYS);
            const nugetSource = await findRandomKnownNugetSource(), source = nugetSource.url, expected = faker_1.faker.string.alphanumeric(32);
            process.env.NUGET_API_KEY = expected;
            // Act
            const result = await resolveNugetApiKey(source);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        ["NUGET_SOURCE", "NUGET_SOURCES", "NUGET_PUSH_SOURCE"].forEach(varname => {
            xit(`should return that for an environmentally-named source in ${varname}`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEYS);
                const source = faker_1.faker.internet.domainName(), expected = faker_1.faker.string.alphanumeric(32);
                process.env.NUGET_API_KEY = expected;
                process.env[varname] = source;
                // Act
                const result = await resolveNugetApiKey();
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
    });
    describe(`when only NUGET_API_KEYS set`, () => {
        describe(`and is a string value`, () => {
            it(`should return that value`, async () => {
                // Arrange
                delete process.env.NUGET_API_KEY;
                const source = await findRandomKnownNugetSource(), expected = faker_1.faker.string.alphanumeric(32);
                process.env.NUGET_API_KEYS = expected;
                // Act
                const result = await resolveNugetApiKey(source.url);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`and is json`, () => {
            it(`should return undefined when the source is unknown and no nuget.org apikey defined`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                const apiKeys = {
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [domainName()]: faker_1.faker.string.alphanumeric(32)
                };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                // Act
                const result = await resolveNugetApiKey();
                // Assert
                expect(result)
                    .toBeUndefined();
            });
            it(`should resolve source urls to source names`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                const knownSources = await dotnetCli.listNugetSources(), selectedSource = faker_1.faker.helpers.arrayElement(knownSources), expected = faker_1.faker.string.alphanumeric(32);
                const apiKeys = {
                    ["some-private-repository"]: faker_1.faker.string.alphanumeric(32),
                    [selectedSource.name]: expected
                };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_PUSH_SOURCE = selectedSource.url;
                // Act
                const result = await resolveNugetApiKey();
                // Assert
                expect(result)
                    .toEqual(expected);
            });
            it(`should handle NUGET_PUSH_SOURCE being an url`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                const dotnetCli = require("dotnet-cli"), knownSources = await dotnetCli.listNugetSources(), selectedSource = faker_1.faker.helpers.arrayElement(knownSources), expected = faker_1.faker.string.alphanumeric(32);
                const apiKeys = {
                    ["https://some-private-repository"]: faker_1.faker.string.alphanumeric(32),
                    [selectedSource.url]: expected
                };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_PUSH_SOURCE = selectedSource.url;
                // Act
                const result = await resolveNugetApiKey();
                // Assert
                expect(result)
                    .toEqual(expected);
            });
            it(`should return the nuget.org key if defined`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                const expected = faker_1.faker.string.alphanumeric(32), nugetOrg = faker_1.faker.helpers.arrayElement(["nuget.org", "NUGET.ORG", "Nuget.org"]), apiKeys = {
                    [nugetOrg]: expected,
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [domainName()]: faker_1.faker.string.alphanumeric(32)
                };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                // Act
                const result = await resolveNugetApiKey();
                // Assert
                expect(result)
                    .toEqual(expected);
            });
            it(`should return the key for the named source`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                const nugetSource = await findRandomKnownNugetSource(), source = nugetSource.name, expected = faker_1.faker.string.alphanumeric(32), apiKeys = {
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [source]: expected
                };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                // Act
                const result = await resolveNugetApiKey(source);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
            it(`should return the key for NUGET_PUSH_SOURCE > NUGET_SOURCE > NUGET_SOURCES[0]`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                const nugetSource = await findRandomKnownNugetSource(), source = nugetSource.url, expected = faker_1.faker.string.alphanumeric(32), apiKeys = {
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [source]: expected
                };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_PUSH_SOURCE = source;
                process.env.NUGET_SOURCE = domainName();
                process.env.NUGET_SOURCES = domainName();
                // Act
                const result = await resolveNugetApiKey();
                // Assert
                expect(result)
                    .toEqual(expected);
            });
            it(`should return the key for NUGET_SOURCE > NUGET_SOURCES[0]`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                const nugetSource = await findRandomKnownNugetSource(), source = nugetSource.url, expected = faker_1.faker.string.alphanumeric(32), apiKeys = {
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [source]: expected
                };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_SOURCE = source;
                process.env.NUGET_SOURCES = domainName();
                // Act
                const result = await resolveNugetApiKey();
                // Assert
                expect(result)
                    .toEqual(expected);
            });
            it(`should return the key for NUGET_SOURCES[0]`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                const nugetSource = await findRandomKnownNugetSource(), source = nugetSource.url, expected = faker_1.faker.string.alphanumeric(32), apiKeys = {
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [source]: expected
                };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_SOURCES = source;
                // Act
                const result = await resolveNugetApiKey();
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
    });
    describe(`when NUGET_API_KEY set _and_ NUGET_API_KEYS set`, () => {
        describe(`when source not in NUGET_API_KEYS`, () => {
            it(`should return NUGET_API_KEY`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                const nugetSource = await findRandomKnownNugetSource(), source = nugetSource.url, expected = faker_1.faker.string.alphanumeric(32), apiKeys = {
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [domainName()]: faker_1.faker.string.alphanumeric(32)
                };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_API_KEY = expected;
                process.env.NUGET_SOURCES = source;
                // Act
                const result = await resolveNugetApiKey(source);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`when given source in NUGET_API_KEYS`, () => {
            it(`should prefer that value`, async () => {
                // Arrange
                blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                const nugetSource = await findRandomKnownNugetSource(), source = nugetSource.url, expected = faker_1.faker.string.alphanumeric(32), apiKeys = {
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [domainName()]: faker_1.faker.string.alphanumeric(32),
                    [source]: expected
                };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_API_KEY = faker_1.faker.string.alphanumeric(32);
                // Act
                const result = await resolveNugetApiKey(source);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`when have environmental source in NUGET_API_KEYS`, () => {
            ["NUGET_SOURCE", "NUGET_SOURCES", "NUGET_PUSH_SOURCE"].forEach((varname) => {
                it(`should prefer that value (${varname})`, async () => {
                    // Arrange
                    blockEnvVars(env.NUGET_API_KEY, env.NUGET_SOURCE, env.NUGET_PUSH_SOURCE, env.NUGET_SOURCES);
                    const nugetSource = await findRandomKnownNugetSource(), source = nugetSource.url, expected = faker_1.faker.string.alphanumeric(32), apiKeys = {
                        [domainName()]: faker_1.faker.string.alphanumeric(32),
                        [domainName()]: faker_1.faker.string.alphanumeric(32),
                        [source]: expected
                    };
                    process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                    process.env.NUGET_API_KEY = faker_1.faker.string.alphanumeric(32);
                    process.env[varname] = source;
                    // Act
                    const result = await resolveNugetApiKey();
                    // Assert
                    expect(result)
                        .toEqual(expected);
                });
            });
        });
    });
    beforeEach(() => {
        snapshotEnv();
    });
    afterEach(() => {
        restoreEnv();
        usedDomainNames.clear();
    });
    let envSnapshot;
    function snapshotEnv() {
        envSnapshot = JSON.parse(JSON.stringify(process.env));
    }
    const usedDomainNames = new Set();
    function domainName() {
        let result;
        do {
            result = faker_1.faker.internet.domainName();
        } while (usedDomainNames.has(result));
        return result;
    }
    function restoreEnv() {
        if (!envSnapshot) {
            return;
        }
        const local = envSnapshot;
        envSnapshot = undefined;
        process.env = JSON.parse(JSON.stringify(local));
    }
    /**
     *  Essentially resets as if the env var isn't set
     *  and bypasses the defaults/fallback logic from
     *  env so all paths can be exercised
     */
    function blockEnvVars(...vars) {
        const notAllowed = new Set(vars), originalResolve = env.resolve.bind(env), originalResolveArray = env.resolveArray.bind(env), originalResolveObject = env.resolveObject.bind(env);
        for (const v of vars) {
            delete process.env[v];
        }
        spyOn(env, "resolve")
            .and.callFake((...args) => {
            const allowed = findAllowed(args);
            if (allowed.length === 0) {
                return resolveManually(...args);
            }
            return originalResolve(...allowed);
        });
        spyOn(env, "resolveArray")
            .and.callFake((...args) => {
            const allowed = findAllowed(args);
            if (allowed.length === 0) {
                const result = resolveManually(...args);
                return (result || "").split(",");
            }
            return originalResolveArray(allowed);
        });
        spyOn(env, "resolveObject")
            .and.callFake((...args) => {
            const allowed = findAllowed(args);
            if (allowed.length === 0) {
                const json = resolveManually(...args);
                return !!json
                    ? JSON.parse(json)
                    : undefined;
            }
            return originalResolveObject(...allowed);
        });
        function resolveManually(...vars) {
            return vars.reduce((acc, cur) => acc || process.env[cur], undefined);
        }
        function findAllowed(args) {
            const result = [];
            for (const arg of args) {
                if (!notAllowed.has(arg)) {
                    result.push(arg);
                }
            }
            return result;
        }
    }
});
