"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
describe(`gulp-nunit-runner module`, () => {
    it(`should return the same function as requiring gulp-nunit-runner`, async () => {
        // Arrange
        const actual = require("../../../gulp-tasks/modules/gulp-nunit-runner/index"), mod = requireModule("gulp-nunit-runner");
        // Act
        expect(actual)
            .toBeFunction();
        expect(mod)
            .toBe(actual);
        // Assert
    });
});
