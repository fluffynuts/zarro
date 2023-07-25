"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
describe(`temporary-environment`, () => {
    const { withEnvironment } = requireModule("temporary-environment");
    it(`should set the provided variables`, async () => {
        // Arrange
        const captured = {}, var1 = faker_1.faker.string.alphanumeric(10), value1 = faker_1.faker.string.alphanumeric(10), var2 = faker_1.faker.string.alphanumeric(10), value2 = faker_1.faker.string.alphanumeric(10);
        // Act
        await withEnvironment({
            [var1]: value1,
            [var2]: value2
        }).run(() => {
            captured[var1] = process.env[var1];
            captured[var2] = process.env[var2];
        });
        // Assert
        expect(captured[var1])
            .toEqual(value1);
        expect(captured[var2])
            .toEqual(value2);
    });
    it(`should reset the prior variables`, async () => {
        // Arrange
        const captured = {}, var1 = faker_1.faker.string.alphanumeric(10), value1 = faker_1.faker.string.alphanumeric(10), value1Original = faker_1.faker.string.alphanumeric(10), var2 = faker_1.faker.string.alphanumeric(10), value2 = faker_1.faker.string.alphanumeric(10), value2Original = faker_1.faker.string.alphanumeric(10);
        // Act
        process.env[var1] = value1Original;
        process.env[var2] = value2Original;
        await withEnvironment({
            [var1]: value1,
            [var2]: value2
        }).run(() => {
            captured[var1] = process.env[var1];
            captured[var2] = process.env[var2];
        });
        // Assert
        expect(captured[var1])
            .toEqual(value1);
        expect(captured[var2])
            .toEqual(value2);
        expect(process.env[var1])
            .toEqual(value1Original);
        expect(process.env[var2])
            .toEqual(value2Original);
    });
    it(`should knock out the existing environment on request`, async () => {
        // Arrange
        const captured = {}, var1 = faker_1.faker.string.alphanumeric(10), value1 = faker_1.faker.string.alphanumeric(10), var2 = faker_1.faker.string.alphanumeric(10), value2 = faker_1.faker.string.alphanumeric(10);
        // Act
        process.env[var1] = value1;
        await withEnvironment({
            [var2]: value2,
        }, true).run(() => {
            captured[var1] = process.env[var1];
            captured[var2] = process.env[var2];
        });
        // Assert
        expect(captured[var1])
            .not.toBeDefined();
    });
});
