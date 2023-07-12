"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
describe(`quote-if-required`, () => {
    const quoteIfRequired = requireModule("quote-if-required");
    const os = require("os");
    describe(`common quoting`, () => {
        it(`should not quote when no whitespace`, async () => {
            // Arrange
            const expected = "123";
            // Act
            const result = quoteIfRequired(expected);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should quote when there's whitespace and no quoting`, async () => {
            // Arrange
            const input = "foo bar";
            const expected = `"foo bar"`;
            // Act
            const result = quoteIfRequired(input);
            // Assert
            expect(result)
                .toEqual(expected);
        });
        it(`should not quote if already quoted (simple, double-quotes)`, async () => {
            // Arrange
            const expected = `"foo bar"`;
            // Act
            const result = quoteIfRequired(expected);
            // Assert
            expect(result)
                .toEqual(expected);
        });
    });
    describe(`platform-specific`, () => {
        describe(`windows quoting`, () => {
            it(`should handle whacky, but valid dos quoting`, async () => {
                // Arrange
                spyOn(os, "platform")
                    .and.returnValue("win32");
                const input = "someVariable=\"already quoted value\"";
                // Act
                const result = quoteIfRequired(input);
                // Assert
                expect(result)
                    .toEqual(input);
            });
        });
        describe(`!windows quoting`, () => {
            it(`should escape quotes`, async () => {
                // Arrange
                spyOn(os, "platform")
                    .and.returnValue("linux");
                const input = `someVariable="already quoted"`;
                const expected = `"someVariable=\\"already quoted\\""`;
                // Act
                const result = quoteIfRequired(input);
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
    });
});
