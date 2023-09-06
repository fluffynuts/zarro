"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
describe(`nuget`, () => {
    const systemMock = jest.fn();
    jest.doMock("../../../gulp-tasks/modules/system", () => systemMock);
    const tryDoMock = jest.fn();
    jest.doMock("../../../gulp-tasks/modules/try-do", () => tryDoMock);
    const SystemResult = requireModule("system-result"), sut = requireModule("nuget");
    it(`should call through to system`, async () => {
        // Arrange
        const args = [faker_1.faker.word.sample(), faker_1.faker.word.sample()], opts = { timeout: 1234 };
        // Act
        const result = await sut(args, opts);
        // Assert
        expect(result)
            .toEqual(stdout.concat(stderr).join("\n"));
        expect(systemMock)
            .toHaveBeenCalledOnceWith(expect.stringContaining("nuget"), args, expect.objectContaining({
            suppressOutput: true,
            timeout: 1234 + 50 /* a little buffer-space is given to execs so that timed-out execs can still have stdio gathered */
        }));
    });
    let stdout = [
        faker_1.faker.word.sample(),
        faker_1.faker.word.sample()
    ], stderr = [
        faker_1.faker.word.sample(),
        faker_1.faker.word.sample()
    ];
    beforeEach(() => {
        mockSystem();
    });
    function mockSystem() {
        systemMock.mockImplementation((exe, args, opts) => {
            if (typeof (opts === null || opts === void 0 ? void 0 : opts.stdout) === "function") {
                for (const line of stdout) {
                    opts.stdout(line);
                }
            }
            if (typeof (opts === null || opts === void 0 ? void 0 : opts.stderr) === "function") {
                for (const line of stderr) {
                    opts.stderr(line);
                }
            }
            return new SystemResult(exe, args || [], 0, stdout, stderr);
        });
        tryDoMock.mockImplementation(async (fn, envVar) => {
            return await fn();
        });
    }
});
