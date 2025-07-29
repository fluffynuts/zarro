"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
const systemWrapper = __importStar(require("system-wrapper"));
describe(`nuget`, () => {
    const { spyOn } = jest;
    const realSystem = Object.assign({}, systemWrapper);
    jest.doMock("system-wrapper", () => {
        return realSystem;
    });
    const tryDoMock = jest.fn();
    jest.doMock("../../../gulp-tasks/modules/try-do", () => tryDoMock);
    const sut = requireModule("nuget");
    it(`should call through to system`, async () => {
        // Arrange
        const args = [faker_1.faker.word.sample(), faker_1.faker.word.sample()], opts = { timeout: 1234 }, stderr = [], stdout = [];
        spyOn(realSystem, "system").mockImplementation((exe, args, opts) => {
            return new Promise(resolve => {
                stderr.push(faker_1.faker.word.sample());
                stdout.push(faker_1.faker.word.sample());
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
                const result = systemWrapper.SystemResult.create()
                    .withExe(exe)
                    .withArgs(args !== null && args !== void 0 ? args : [])
                    .withExitCode(0)
                    .withStdErr(stderr)
                    .withStdOut(stdout)
                    .build();
                resolve(result);
            });
        });
        // Act
        const result = await sut(args, opts);
        // Assert
        expect(result)
            .toEqual(stdout.concat(stderr).join("\n"));
        expect(realSystem.system)
            .toHaveBeenCalledOnceWith(expect.stringContaining("nuget"), args, expect.objectContaining({
            suppressOutput: true,
            timeout: 1234 + 50 /* a little buffer-space is given to execs so that timed-out execs can still have stdio gathered */
        }));
    });
    beforeEach(() => {
        mockTryDo();
    });
    function mockTryDo() {
        tryDoMock.mockImplementation(async (fn, envVar) => {
            return await fn();
        });
    }
});
