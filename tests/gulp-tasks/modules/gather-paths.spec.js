"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sut = require("../../../gulp-tasks/modules/gather-paths");
require("expect-even-more-jest");
describe(`gather-paths module`, () => {
    it(`should export a single function`, async () => {
        // Arrange
        // Act
        expect(sut).toBeFunction();
        // Assert
    });
    describe(`function`, () => {
        it(`should find js files`, async () => {
            // Arrange
            // Act
            const result = await sut([
                "**/local-tasks/**/*.js",
                "**/gulp-tasks/modules/**/*.js"
            ]);
            // Assert
            expect(result)
                .not.toBeEmptyArray();
            expect(!!result.find(p => !!p.match(/.*local-tasks.*js$/)))
                .toBeTrue();
            expect(!!result.find(p => !!p.match(/.*gulp-tasks.*js$/)))
                .toBeTrue();
        });
    });
});
