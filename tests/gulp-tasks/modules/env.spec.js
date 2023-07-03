"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
const filesystem_sandbox_1 = require("filesystem-sandbox");
describe(`env`, () => {
    const env = requireModule("env");
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
            process.env[key] = envVar;
            const result = env.resolveArray(key);
            // Assert
            expect(result)
                .toEqual(values);
        });
        it(`should resolve the array with custom delimiter`, async () => {
            // Arrange
            const values = [faker_1.faker.word.sample(), faker_1.faker.word.sample(), faker_1.faker.word.sample()], key = faker_1.faker.string.sample(10), delimiter = faker_1.faker.helpers.arrayElement([";", ":", "/"]), envVar = values.join(delimiter);
            // Act
            process.env[key] = envVar;
            const result = env.resolveArray(key, delimiter);
            // Assert
            expect(result)
                .toEqual(values);
        });
    });
    describe(`resolveMap`, () => {
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
        afterEach(async () => {
            await filesystem_sandbox_1.Sandbox.destroyAll();
        });
    });
});
