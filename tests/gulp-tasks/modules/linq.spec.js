"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
require("expect-even-more-jest");
describe(`linq`, () => {
    const { first, last, skip, take } = requireModule("linq");
    describe(`last`, () => {
        describe(`given empty array`, () => {
            it(`should return undefined`, async () => {
                // Arrange
                // Act
                const result = last([]);
                // Assert
                expect(result)
                    .toBeUndefined();
            });
        });
        describe(`given array of items`, () => {
            it(`should return the last item`, async () => {
                // Arrange
                const w1 = faker_1.faker.word.sample(), w2 = faker_1.faker.word.sample(), w3 = faker_1.faker.word.sample(), arr = [w1, w2, w3];
                // Act
                const result = last(arr);
                // Assert
                expect(result)
                    .toEqual(w3);
            });
        });
    });
    describe(`first`, () => {
        describe(`given empty array`, () => {
            it(`should return undefined`, async () => {
                // Arrange
                // Act
                const result = first([]);
                // Assert
                expect(result)
                    .toBeUndefined();
            });
        });
        describe(`given array of items`, () => {
            it(`should return the last item`, async () => {
                // Arrange
                const w1 = faker_1.faker.word.sample(), w2 = faker_1.faker.word.sample(), w3 = faker_1.faker.word.sample(), arr = [w1, w2, w3];
                // Act
                const result = first(arr);
                // Assert
                expect(result)
                    .toEqual(w1);
            });
        });
    });
    describe(`skip`, () => {
        describe(`given null`, () => {
            it(`should provide empty iterator`, async () => {
                // Arrange
                // Act
                const result = Array.from(skip(null, 2));
                // Assert
                expect(result)
                    .toBeEmptyArray();
            });
        });
        it(`should provide a lazy iterator from the provided offset`, async () => {
            // Arrange
            const input = [2, 3, 4, 5], collected = [];
            // Act
            for (let i of skip(input, 1)) {
                collected.push(i);
            }
            // Assert
            expect(collected)
                .toEqual([3, 4, 5]);
        });
        describe(`given offset after the end of the array`, () => {
            it(`should provide an empty iterator`, async () => {
                // Arrange
                // Act
                const result = Array.from(skip([1, 2, 3], 4));
                // Assert
                expect(result)
                    .toBeEmptyArray();
            });
        });
    });
    describe(`take`, () => {
        describe(`given null`, () => {
            it(`should return empty array`, async () => {
                // Arrange
                // Act
                const result = Array.from(take(null, 2));
                // Assert
                expect(result)
                    .toBeEmptyArray();
            });
        });
        it(`should return the number of items from the array when available`, () => {
            // Arrange
            const items = [1, 2, 3, 4];
            // Act
            const result = Array.from(take(skip(items, 1), 2));
            // Assert
            expect(result)
                .toEqual([2, 3]);
        });
    });
});
