"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
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
        expect(result.find(s => s.match(/undefined/)))
            .not.toExist();
    });
    for (let i = 0; i < 50; i++) {
        it(`should merge multiple includes`, async () => {
            // Arrange
            const v1 = [faker_1.faker.word.sample(), faker_1.faker.word.sample()], v2 = [faker_1.faker.word.sample(), faker_1.faker.word.sample()], v3 = [faker_1.faker.word.sample(), faker_1.faker.word.sample()], v4 = [faker_1.faker.word.sample(), faker_1.faker.word.sample()], k1 = `k1_${faker_1.faker.word.sample(10)}`, k2 = `k2_${faker_1.faker.word.sample(10)}`, k3 = `k3_${faker_1.faker.word.sample(10)}`, k4 = `k4_${faker_1.faker.word.sample(10)}`;
            setEnv(k1, v1.join(","));
            setEnv(k2, v2.join(","));
            setEnv(k3, v3.join(","));
            setEnv(k4, v4.join(","));
            let result = [];
            // Act
            result = sut([k1, k2], [k3, k4]);
            // Assert
            expect(result)
                .toHaveLength(8);
            expect(result)
                .toContain(`**/${v1[0]}`);
            expect(result)
                .toContain(`**/${v1[1]}`);
            expect(result)
                .toContain(`**/${v2[0]}`);
            expect(result)
                .toContain(`**/${v2[1]}`);
            expect(result)
                .toContain(`!**/${v3[0]}`);
            expect(result)
                .toContain(`!**/${v3[1]}`);
            expect(result)
                .toContain(`!**/${v4[0]}`);
            expect(result)
                .toContain(`!**/${v4[1]}`);
        });
    }
    function setEnv(name, value) {
        process.env[name] = value;
        cleanVars.push(name);
    }
    const cleanVars = [];
    afterEach(() => {
        for (const v of cleanVars) {
            delete process.env[v];
        }
        cleanVars.splice(0, cleanVars.length);
    });
});
