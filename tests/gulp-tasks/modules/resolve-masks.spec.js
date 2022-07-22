"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const sut = requireModule("resolve-masks");
describe(`resolve-masks`, () => {
    it(`should leave out the undefined env var`, async () => {
        // Arrange
        process.env["MOO_INCLUDE"] = "moo";
        expect(process.env["MOO_EXCLUDE"])
            .not.toBeDefined();
        // Act
        const result = sut("MOO_INCLUDE", ["MOO_EXCLUDE"]);
        // Assert
        console.log(result);
        expect(result.find(s => s.match(/undefined/)))
            .not.toExist();
    });
});
