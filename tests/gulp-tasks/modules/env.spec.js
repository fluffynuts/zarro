"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
const filesystem_sandbox_1 = require("filesystem-sandbox");
describe(`env`, () => {
    const env = requireModule("env");
    describe(`resolveObject`, () => {
        it(`should return undefined when var not set`, async () => {
            // Arrange
            const varname = `${faker_1.faker.word.sample()}_${faker_1.faker.word.sample()}`;
            expect(process.env[varname])
                .not.toBeDefined();
            // Act
            const result = env.resolveObject(varname);
            // Assert
            expect(result)
                .not.toBeDefined();
        });
        it(`should return the json value as an object`, async () => {
            // Arrange
            const varname = `${faker_1.faker.word.sample()}_${faker_1.faker.word.sample()}`, expected = {
                id: faker_1.faker.number.int(),
                name: faker_1.faker.person.firstName()
            };
            envVars.push(varname);
            process.env[varname] = JSON.stringify(expected);
            // Act
            const result = env.resolveObject(varname);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should throw when the json cannot be parsed`, async () => {
            // Arrange
            const varname = `${faker_1.faker.word.sample()}_${faker_1.faker.word.sample()}`;
            envVars.push(varname);
            process.env[varname] = faker_1.faker.word.words(2);
            // Act
            expect(() => env.resolveObject(varname))
                .toThrow();
            // Assert
        });
        const envVars = [];
        afterEach(() => {
            const toDelete = envVars.splice(0, envVars.length);
            for (const v of toDelete) {
                delete process.env[v];
            }
        });
    });
    describe(`resolveArray`, () => {
        it(`should resolve undefined var to []`, async () => {
            // Arrange
            const name = "moo_cakes";
            delete process.env[name];
            // Act
            const result = env.resolveArray(name);
            // Assert
            expect(result)
                .toEqual([]);
        });
        it(`should resolve the comma-delimited array`, async () => {
            // Arrange
            const values = [faker_1.faker.word.sample(), faker_1.faker.word.sample(), faker_1.faker.word.sample()], key = faker_1.faker.string.sample(10), envVar = values.join(",");
            // Act
            setEnv(key, envVar);
            const result = env.resolveArray(key);
            // Assert
            expect(result)
                .toEqual(values);
        });
        it(`should resolve the comma-delimited array from the first defined var`, async () => {
            // Arrange
            const values = [faker_1.faker.word.sample(), faker_1.faker.word.sample(), faker_1.faker.word.sample()], missingKey = faker_1.faker.string.sample(10), key = faker_1.faker.string.sample(10), envVar = values.join(",");
            // Act
            setEnv(key, envVar);
            const result = env.resolveArray([missingKey, key]);
            // Assert
            expect(result)
                .toEqual(values);
        });
        it(`should resolve the array with custom delimiter`, async () => {
            // Arrange
            const values = [faker_1.faker.word.sample(), faker_1.faker.word.sample(), faker_1.faker.word.sample()], key = faker_1.faker.string.sample(10), delimiter = faker_1.faker.helpers.arrayElement([";", ":", "/"]), envVar = values.join(delimiter);
            // Act
            setEnv(key, envVar);
            const result = env.resolveArray(key, delimiter);
            // Assert
            expect(result)
                .toEqual(values);
        });
        function setEnv(name, value) {
            process.env[name] = value;
            cleanVars.push(name);
        }
        const cleanVars = [];
        afterEach(() => {
            for (const v of cleanVars) {
                delete process.env[v];
            }
            cleanVars.splice(0, cleanVars.length);
        });
    });
    describe(`resolveMergedArray`, () => {
        it(`should resolve undefined var to []`, async () => {
            // Arrange
            const name = "moo_cakes";
            delete process.env[name];
            // Act
            const result = env.resolveArray(name);
            // Assert
            expect(result)
                .toEqual([]);
        });
        it(`should resolve the comma-delimited array`, async () => {
            // Arrange
            const values = [faker_1.faker.word.sample(), faker_1.faker.word.sample(), faker_1.faker.word.sample()], key = faker_1.faker.string.sample(10), envVar = values.join(",");
            // Act
            setEnv(key, envVar);
            const result = env.resolveArray(key);
            // Assert
            expect(result)
                .toEqual(values);
        });
        it(`should resolve the array with custom delimiter`, async () => {
            // Arrange
            const values = [faker_1.faker.word.sample(), faker_1.faker.word.sample(), faker_1.faker.word.sample()], key = faker_1.faker.string.sample(10), delimiter = faker_1.faker.helpers.arrayElement([";", ":", "/"]), envVar = values.join(delimiter);
            // Act
            setEnv(key, envVar);
            const result = env.resolveArray(key, delimiter);
            // Assert
            expect(result)
                .toEqual(values);
        });
        it(`should resolve merged array from all env vars`, async () => {
            // Arrange
            const k1 = faker_1.faker.word.sample(), v1 = [faker_1.faker.word.sample(), faker_1.faker.word.sample()], k2 = faker_1.faker.word.sample(), v2 = [faker_1.faker.word.sample()];
            setEnv(k1, v1.join(","));
            setEnv(k2, v2.join(","));
            // Act
            const result = env.resolveMergedArray([k1, k2]);
            // Assert
            expect(result)
                .toEqual(v1.concat(v2));
        });
        function setEnv(name, value) {
            process.env[name] = value;
            cleanVars.push(name);
        }
        const cleanVars = [];
        afterEach(() => {
            for (const v of cleanVars) {
                delete process.env[v];
            }
            cleanVars.splice(0, cleanVars.length);
        });
    });
    describe.only(`resolveMap`, () => {
        beforeEach(() => {
            process.env.ZARRO_ALLOW_FILE_RESOLUTIONS = undefined;
            delete process.env.ZARRO_ALLOW_FILE_RESOLUTIONS;
        });
        it(`should resolve empty var to empty object`, async () => {
            // Arrange
            const key = faker_1.faker.string.sample(10);
            // Act
            delete process.env[key];
            const result = env.resolveMap(key);
            // Assert
            expect(result)
                .toEqual({});
        });
        it(`should resolve comma-delimited pairs`, async () => {
            // Arrange
            const expected = {
                foo: faker_1.faker.word.sample(),
                bar: faker_1.faker.word.sample()
            }, key = faker_1.faker.string.sample(10), envVar = `foo=${expected.foo},bar=${expected.bar}`;
            // Act
            process.env[key] = envVar;
            const result = env.resolveMap(key);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should resolve a JSON var`, async () => {
            // Arrange
            const expected = {
                foo: faker_1.faker.word.sample(),
                bar: faker_1.faker.word.sample()
            }, key = faker_1.faker.string.sample(10), envVar = JSON.stringify(expected);
            // Act
            process.env[key] = envVar;
            const result = env.resolveMap(key);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should resolve JSON from a file, if present & enabled`, async () => {
            // Arrange
            process.env.ZARRO_ALLOW_FILE_RESOLUTIONS = "1";
            const sandbox = await filesystem_sandbox_1.Sandbox.create(), expected = {
                foo: faker_1.faker.word.sample(),
                bar: faker_1.faker.word.sample()
            }, key = faker_1.faker.string.alphanumeric(10);
            await sandbox.writeFile(key, JSON.stringify(expected));
            // Act
            delete process.env[key];
            const result = await sandbox.run(() => env.resolveMap(key));
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should resolve simple values from file too`, async () => {
            // Arrange
            const sandbox = await filesystem_sandbox_1.Sandbox.create(), expected = faker_1.faker.word.sample(), key = faker_1.faker.string.alphanumeric(10);
            await sandbox.writeFile(key, expected);
            // Act
            delete process.env[key];
            const result = await sandbox.run(() => env.resolve(key));
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should resolve simple values from file with extra newline too`, async () => {
            // Arrange
            const sandbox = await filesystem_sandbox_1.Sandbox.create(), expected = faker_1.faker.word.sample(), key = faker_1.faker.string.alphanumeric(10);
            await sandbox.writeFile(key, `${expected}\n`);
            // Act
            delete process.env[key];
            const result = await sandbox.run(() => env.resolve(key));
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should resolve the default value when the env var is not set`, async () => {
            // Arrange
            const key = faker_1.faker.string.alphanumeric(16);
            env.register({
                name: key,
                help: "some help",
                default: "true"
            });
            // Act
            delete process.env[key];
            const result = env.resolveFlag(key);
            // Assert
            expect(result)
                .toBeTrue();
        });
        it(`should resolve the default value when the env var is not set (2)`, async () => {
            // Arrange
            // Act
            const result = env.resolveFlag("INITIAL_RELEASE");
            // Assert
            expect(result)
                .toBeFalse();
        });
        it(`should use the fallback value when the flag is not set in the environment`, async () => {
            // Arrange
            // Act
            const result1 = env.resolveFlag("FOO_BAR_QUUZ", false);
            const result2 = env.resolveFlag("FOO_BAR_QUUZ", true);
            // Assert
            expect(result1)
                .toBeFalse();
            expect(result2)
                .toBeTrue();
        });
        afterEach(async () => {
            await filesystem_sandbox_1.Sandbox.destroyAll();
        });
    });
    describe(`resolve`, () => {
        it(`should be a function`, async () => {
            // Arrange
            // Act
            expect(env.resolve)
                .toBeFunction();
            // Assert
        });
        it(`should throw when given no env var names`, async () => {
            // Arrange
            // Act
            expect(() => env.resolve())
                .toThrow();
            // Assert
        });
        it(`should return the defined environment variable for a single var name`, async () => {
            // Arrange
            const key = faker_1.faker.string.alphanumeric(10), expected = setEnv(key, faker_1.faker.string.alphanumeric(10));
            // Act
            const result = env.resolve(key);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should resolve the fallback variable`, async () => {
            // Arrange
            const missing = faker_1.faker.string.alphanumeric(10), key = faker_1.faker.string.alphanumeric(10), expected = setEnv(key, faker_1.faker.string.alphanumeric(10));
            // Act
            const result = env.resolve(missing, key);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should resolve the initial variable when the fallback is not found`, async () => {
            // Arrange
            const missing = faker_1.faker.string.alphanumeric(10), key = faker_1.faker.string.alphanumeric(10), expected = setEnv(key, faker_1.faker.string.alphanumeric(10));
            // Act
            const result = env.resolve(key, missing);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        const testVars = {};
        function setEnv(name, value) {
            testVars[name] = value;
            process.env[name] = value;
            return value;
        }
        afterEach(() => {
            for (const key of Object.keys(testVars)) {
                delete process.env[key];
                delete testVars[key];
            }
        });
    });
    describe(`resolveRequired`, () => {
        it(`should be a function`, async () => {
            // Arrange
            // Act
            expect(env.resolveRequired)
                .toBeFunction();
            // Assert
        });
        it(`should return the defined environment variable for a single var name`, async () => {
            // Arrange
            const key = faker_1.faker.string.alphanumeric(10), expected = setEnv(key, faker_1.faker.string.alphanumeric(10));
            // Act
            const result = env.resolveRequired(key);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should resolve the fallback variable`, async () => {
            // Arrange
            const missing = faker_1.faker.string.alphanumeric(10), key = faker_1.faker.string.alphanumeric(10), expected = setEnv(key, faker_1.faker.string.alphanumeric(10));
            // Act
            const result = env.resolveRequired(missing, key);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should resolve the initial variable when the fallback is not found`, async () => {
            // Arrange
            const missing = faker_1.faker.string.alphanumeric(10), key = faker_1.faker.string.alphanumeric(10), expected = setEnv(key, faker_1.faker.string.alphanumeric(10));
            // Act
            const result = env.resolveRequired(key, missing);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should throw when the environment variable(s) weren't found`, async () => {
            // Arrange
            const missing1 = faker_1.faker.string.alphanumeric(10), missing2 = faker_1.faker.string.alphanumeric(10);
            // Act
            expect(() => env.resolveRequired(missing1, missing2))
                .toThrow();
            // Assert
        });
        const testVars = {};
        function setEnv(name, value) {
            testVars[name] = value;
            process.env[name] = value;
            return value;
        }
        afterEach(() => {
            for (const key of Object.keys(testVars)) {
                delete process.env[key];
                delete testVars[key];
            }
        });
    });
    describe(`resolveWithFallback`, () => {
        const varname = "TEST_RESOLVE_WITH_FALLBACK";
        beforeAll(() => {
            env.register({
                name: varname,
                default: "wibbles",
                help: ""
            });
        });
        beforeEach(() => {
            process.env[varname] = undefined;
            delete process.env[varname];
        });
        it(`should resolve the env var that was set`, async () => {
            // Arrange
            const expected = faker_1.faker.word.sample();
            process.env[varname] = expected;
            // Act
            const result = env.resolveWithFallback(varname, "some fallback value");
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should resolve the fallback if not set`, async () => {
            // Arrange
            const expected = faker_1.faker.word.sample;
            expect(process.env[varname])
                .not.toBeDefined();
            // Act
            const result = env.resolveWithFallback(varname, expected);
            // Assert
            expect(result)
                .toEqual(expected);
        });
    });
});
