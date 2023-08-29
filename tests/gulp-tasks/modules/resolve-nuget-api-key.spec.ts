import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import exp from "constants";

describe(`resolve-nuget-api-key`, () => {
    const resolveNugetApiKey = requireModule<ResolveNugetApiKey>("resolve-nuget-api-key");
    const env = requireModule<Env>("env");
    describe(`when NUGET_API_KEY not set and NUGET_API_KEYS not set`, () => {
        it(`should return undefined`, async () => {
            // Arrange
            blockEnvVars(
                env.NUGET_API_KEY,
                env.NUGET_API_KEYS
            );
            expect(env.resolveObject(env.NUGET_API_KEYS))
                .toBeUndefined();
            // Act
            const result = resolveNugetApiKey();
            // Assert
            expect(result)
                .not.toBeDefined();
        });
    });


    describe(`when only NUGET_API_KEY set`, () => {
        it(`should return that for unnamed source`, async () => {
            // Arrange
            blockEnvVars(
                env.NUGET_API_KEYS,
                env.NUGET_SOURCE,
                env.NUGET_PUSH_SOURCE,
                env.NUGET_SOURCES
            );
            const
                expected = faker.string.alphanumeric(32);
            process.env.NUGET_API_KEY = expected;
            // Act
            const result = resolveNugetApiKey();
            // Assert
            expect(result)
                .toEqual(expected);
        });

        it(`should return that for a named source`, async () => {
            // Arrange
            blockEnvVars(env.NUGET_API_KEYS);
            const
                source = faker.internet.domainName(),
                expected = faker.string.alphanumeric(32);
            process.env.NUGET_API_KEY = expected;
            // Act
            const result = resolveNugetApiKey(source);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        [ "NUGET_SOURCE", "NUGET_SOURCES", "NUGET_PUSH_SOURCE" ].forEach(
            varname => {
                it(`should return that for an environmentally-named source in ${ varname }`, async () => {
                    // Arrange
                    blockEnvVars(env.NUGET_API_KEYS);
                    const
                        source = faker.internet.domainName(),
                        expected = faker.string.alphanumeric(32);
                    process.env.NUGET_API_KEY = expected;
                    process.env[varname] = source;
                    // Act
                    const result = resolveNugetApiKey();
                    // Assert
                    expect(result)
                        .toEqual(expected);
                });
            });

        it(`should prefer NUGET_PUSH_SOURCE over NUGET_SOURCE and NUGET_SOURCES`, async () => {
            // Arrange
            delete process.env.NUGET_API_KEYS;
            const
                source = faker.internet.domainName(),
                expected = faker.string.alphanumeric(32);
            process.env.NUGET_API_KEY = expected;
            process.env["NUGET_PUSH_SOURCE"] = source;
            process.env["NUGET_SOURCE"] = faker.internet.domainName();
            process.env["NUGET_SOURCES"] = faker.internet.domainName();
            // Act
            const result = resolveNugetApiKey();
            // Assert
            expect(result)
                .toEqual(expected);
        });

        it(`should prefer NUGET_SOURCE over NUGET_SOURCES`, async () => {
            // Arrange
            delete process.env.NUGET_API_KEYS;
            delete process.env.NUGET_PUSH_SOURCE;
            const
                source = faker.internet.domainName(),
                expected = faker.string.alphanumeric(32);
            process.env.NUGET_API_KEY = expected;
            process.env["NUGET_SOURCE"] = source;
            process.env["NUGET_SOURCES"] = faker.internet.domainName();
            // Act
            const result = resolveNugetApiKey();
            // Assert
            expect(result)
                .toEqual(expected);
        });
    });

    describe(`when only NUGET_API_KEYS set`, () => {
        describe(`and is a string value`, () => {
            it(`should return that value`, async () => {
                // Arrange
                delete process.env.NUGET_API_KEY;
                const
                    expected = faker.string.alphanumeric(32);
                process.env.NUGET_API_KEYS = expected;
                // Act
                const result = resolveNugetApiKey(faker.internet.domainName());
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`and is json`, () => {
            it(`should return undefined when the source is unknown`, async () => {
                // Arrange
                delete process.env.NUGET_API_KEY;
                delete process.env.NUGET_SOURCE;
                delete process.env.NUGET_PUSH_SOURCE;
                delete process.env.NUGET_SOURCES;
                const
                    apiKeys = {
                        [domainName()]: faker.string.alphanumeric(32),
                        [domainName()]: faker.string.alphanumeric(32)
                    };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                // Act
                const result = resolveNugetApiKey();
                // Assert
                expect(result)
                    .toBeUndefined();
            });
            it(`should return the key for the named source`, async () => {
                // Arrange
                delete process.env.NUGET_API_KEY;
                delete process.env.NUGET_SOURCE;
                delete process.env.NUGET_PUSH_SOURCE;
                delete process.env.NUGET_SOURCES;
                const
                    source = domainName(),
                    expected = faker.string.alphanumeric(32),
                    apiKeys = {
                        [domainName()]: faker.string.alphanumeric(32),
                        [domainName()]: faker.string.alphanumeric(32),
                        [source]: expected
                    };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                // Act
                const result = resolveNugetApiKey(source);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
            it(`should return the key for NUGET_PUSH_SOURCE > NUGET_SOURCE > NUGET_SOURCES[0]`, async () => {
                // Arrange
                delete process.env.NUGET_API_KEY;
                delete process.env.NUGET_SOURCE;
                delete process.env.NUGET_PUSH_SOURCE;
                delete process.env.NUGET_SOURCES;
                const
                    source = domainName(),
                    expected = faker.string.alphanumeric(32),
                    apiKeys = {
                        [domainName()]: faker.string.alphanumeric(32),
                        [domainName()]: faker.string.alphanumeric(32),
                        [source]: expected
                    };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_PUSH_SOURCE = source;
                process.env.NUGET_SOURCE = domainName();
                process.env.NUGET_SOURCES = domainName();
                // Act
                const result = resolveNugetApiKey();
                // Assert
                expect(result)
                    .toEqual(expected);
            });
            it(`should return the key for NUGET_SOURCE > NUGET_SOURCES[0]`, async () => {
                // Arrange
                delete process.env.NUGET_API_KEY;
                delete process.env.NUGET_SOURCE;
                delete process.env.NUGET_PUSH_SOURCE;
                delete process.env.NUGET_SOURCES;
                const
                    source = domainName(),
                    expected = faker.string.alphanumeric(32),
                    apiKeys = {
                        [domainName()]: faker.string.alphanumeric(32),
                        [domainName()]: faker.string.alphanumeric(32),
                        [source]: expected
                    };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_SOURCE = source;
                process.env.NUGET_SOURCES = domainName();
                // Act
                const result = resolveNugetApiKey();
                // Assert
                expect(result)
                    .toEqual(expected);
            });
            it(`should return the key for NUGET_SOURCES[0]`, async () => {
                // Arrange
                delete process.env.NUGET_API_KEY;
                delete process.env.NUGET_SOURCE;
                delete process.env.NUGET_PUSH_SOURCE;
                delete process.env.NUGET_SOURCES;
                const
                    source = domainName(),
                    expected = faker.string.alphanumeric(32),
                    apiKeys = {
                        [domainName()]: faker.string.alphanumeric(32),
                        [domainName()]: faker.string.alphanumeric(32),
                        [source]: expected
                    };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_SOURCES = source;
                // Act
                const result = resolveNugetApiKey();
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
                delete process.env.NUGET_API_KEY;
                delete process.env.NUGET_SOURCE;
                delete process.env.NUGET_PUSH_SOURCE;
                delete process.env.NUGET_SOURCES;
                const
                    source = domainName(),
                    expected = faker.string.alphanumeric(32),
                    apiKeys = {
                        [domainName()]: faker.string.alphanumeric(32),
                        [domainName()]: faker.string.alphanumeric(32)
                    };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_API_KEY = expected;
                process.env.NUGET_SOURCES = source;
                // Act
                const result = resolveNugetApiKey(source);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`when given source in NUGET_API_KEYS`, () => {
            it(`should prefer that value`, async () => {
                // Arrange
                delete process.env.NUGET_API_KEY;
                delete process.env.NUGET_SOURCE;
                delete process.env.NUGET_PUSH_SOURCE;
                delete process.env.NUGET_SOURCES;
                const
                    source = domainName(),
                    expected = faker.string.alphanumeric(32),
                    apiKeys = {
                        [domainName()]: faker.string.alphanumeric(32),
                        [domainName()]: faker.string.alphanumeric(32),
                        [source]: expected
                    };
                process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                process.env.NUGET_API_KEY = faker.string.alphanumeric(32);
                // Act
                const result = resolveNugetApiKey(source);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`when have environmental source in NUGET_API_KEYS`, () => {
            [ "NUGET_SOURCE", "NUGET_SOURCES", "NUGET_PUSH_SOURCE" ].forEach(
                (varname: string) => {
                    it(`should prefer that value (${ varname })`, async () => {
                        // Arrange
                        delete process.env.NUGET_API_KEY;
                        delete process.env.NUGET_SOURCE;
                        delete process.env.NUGET_PUSH_SOURCE;
                        delete process.env.NUGET_SOURCES;
                        const
                            source = domainName(),
                            expected = faker.string.alphanumeric(32),
                            apiKeys = {
                                [domainName()]: faker.string.alphanumeric(32),
                                [domainName()]: faker.string.alphanumeric(32),
                                [source]: expected
                            };
                        process.env.NUGET_API_KEYS = JSON.stringify(apiKeys);
                        process.env.NUGET_API_KEY = faker.string.alphanumeric(32);
                        process.env[varname] = source;
                        // Act
                        const result = resolveNugetApiKey();
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

    let envSnapshot: Optional<Dictionary<string>>;

    function snapshotEnv() {
        envSnapshot = JSON.parse(
            JSON.stringify(
                process.env
            )
        );
    }

    const usedDomainNames = new Set<string>();

    function domainName() {
        let result;
        do {
            result = faker.internet.domainName();
        } while (usedDomainNames.has(result));
        return result;
    }

    function restoreEnv() {
        if (!envSnapshot) {
            return;
        }
        const local = envSnapshot;
        envSnapshot = undefined;
        process.env = JSON.parse(
            JSON.stringify(
                local
            )
        );
    }

    function blockEnvVars(...vars: string[]) {
        const
            notAllowed = new Set(vars),
            originalResolve = env.resolve.bind(env),
            originalResolveArray = env.resolveArray.bind(env),
            originalResolveObject = env.resolveObject.bind(env);
        spyOn(env, "resolve")
            .and.callFake((...args: string[]) => {
            const allowed = findAllowed(args);
            if (allowed.length === 0) {
                return undefined;
            }
            return originalResolve(...allowed);
        });

        spyOn(env, "resolveArray")
            .and.callFake((...args: string[]) => {
                const allowed = findAllowed(args);
                if (allowed.length === 0) {
                    return undefined;
                }
                return originalResolveArray(allowed);
        });

        spyOn(env, "resolveObject")
            .and.callFake((...args: string[]) => {
            const allowed = findAllowed(args);
            if (allowed.length === 0) {
                return undefined;
            }
            return originalResolveObject(...allowed);
        });

        function findAllowed(args: string[]) {
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
