"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
describe(`timestamp`, () => {
    const { timestamp } = requireModule("timestamp");
    describe(`default behavior`, () => {
        it(`should return the timestamp in format yyyyMMddHHmmss`, async () => {
            // Arrange
            const now = new Date(), expected = `${z(now.getFullYear())}${z(now.getMonth() + 1)}${z(now.getDate())}${z(now.getHours())}${z(now.getMinutes())}${z(now.getSeconds())}`;
            // Act
            const result = timestamp({
                forDate: now
            });
            // Assert
            expect(result)
                .toEqual(expected);
        });
    });
    describe(`options`, () => {
        describe(`when instructed to include milliseconds`, () => {
            it(`should include ms`, async () => {
                // Arrange
                const now = new Date(), expected = `${z(now.getFullYear())}${z(now.getMonth() + 1)}${z(now.getDate())}${z(now.getHours())}${z(now.getMinutes())}${z(now.getSeconds())}${z(now.getMilliseconds(), 3)}`;
                // Act
                const result = timestamp({
                    forDate: now,
                    includeMilliseconds: true
                });
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`when instructed to omit seconds`, () => {
            it(`should omit the seconds`, async () => {
                // Arrange
                const now = new Date(), expected = `${z(now.getFullYear())}${z(now.getMonth() + 1)}${z(now.getDate())}${z(now.getHours())}${z(now.getMinutes())}`;
                // Act
                const result = timestamp({
                    forDate: now,
                    includeSeconds: false
                });
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`when instructed to use short year`, () => {
            it(`should use short year`, async () => {
                // Arrange
                const now = new Date(), expected = `${z(now.getFullYear()).substring(2, 4)}${z(now.getMonth() + 1)}${z(now.getDate())}${z(now.getHours())}${z(now.getMinutes())}${z(now.getSeconds())}`;
                // Act
                const result = timestamp({
                    forDate: now,
                    fullYear: false
                });
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
        describe(`when given a custom delimiter`, () => {
            it(`should use it`, async () => {
                // Arrange
                const now = new Date(), delimiter = faker_1.faker.helpers.arrayElement([".", "-", "_", "*"]), expected = `${z(now.getFullYear())}${delimiter}${z(now.getMonth() + 1)}${delimiter}${z(now.getDate())}${delimiter}${z(now.getHours())}${delimiter}${z(now.getMinutes())}${delimiter}${z(now.getSeconds())}`;
                // Act
                const result = timestamp({
                    forDate: now,
                    delimiter
                });
                // Assert
                expect(result)
                    .toEqual(expected);
            });
        });
    });
    function z(value, size = 2) {
        let result = `${value}`;
        return result.padStart(size, "0");
    }
});
