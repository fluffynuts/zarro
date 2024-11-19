"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
describe(`parse-flag`, () => {
    const { parseFlag } = requireModule("parse-flag");
    function tc(input, expected) {
        return {
            input,
            expected
        };
    }
    [
        tc("1", true),
        tc("0", false),
        tc("yes", true),
        tc("Y", true),
        tc("y", true),
        tc("YeS", true),
        tc("no", false),
        tc("NO", false),
        tc("N", false),
        tc("n", false),
        tc("true", true),
        tc("false", false),
        tc("True", true),
        tc("False", false),
        tc("TrUE", true),
        tc("FalSe", false),
        tc("on", true),
        tc("off", false)
    ].forEach(testCase => {
        const { input, expected } = testCase;
        it(`should parse ${input} to ${expected}`, async () => {
            // Arrange
            // Act
            const result = parseFlag(input);
            // Assert
            expect(result)
                .toEqual(expected);
        });
    });
    describe(`when unable to parse`, () => {
        describe(`and have fallback`, () => {
            it(`should return the fallback`, async () => {
                // Arrange
                const expected = faker_1.faker.datatype.boolean();
                // Act
                const result = parseFlag("wibbles", expected);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`and have no fallback`, () => {
            it(`should throw`, async () => {
                // Arrange
                // Act
                expect(() => parseFlag("wibbles"))
                    .toThrow(/not a valid flag value/);
                // Assert
            });
        });
    });
});