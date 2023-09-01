"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
describe(`generate-version-suffix`, () => {
    const sut = requireModule("generate-version-suffix");
    const { init } = requireModule("git-sha");
    if (!(sut())) {
        throw new Error(`no sha set yet`);
    }
    else {
        console.log(sut());
    }
    beforeAll(async () => {
        await init();
    });
    it(`should generate a suffix with a date part and a sha part`, async () => {
        // Arrange
        // Act
        const result = sut();
        // Assert
        const parts = result.split(".");
        console.log({
            result,
            parts
        });
        expect(parts.length)
            .toEqual(2);
        expect(parts[0])
            .not.toBeEmptyString();
        expect(parts[1])
            .not.toBeEmptyString();
        expect(parts[0].match(/^\d+$/))
            .not.toBeNull();
        expect(parts[0].match(/^[A-Za-z0-9]+$/))
            .not.toBeNull();
    });
});
