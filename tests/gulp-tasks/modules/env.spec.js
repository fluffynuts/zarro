"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
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
    });
});
