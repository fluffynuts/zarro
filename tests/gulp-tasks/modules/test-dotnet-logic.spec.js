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
const realSystem = requireModule("system");
const fakeSystem = jest.fn();
jest.doMock("../../../gulp-tasks/modules/system", () => fakeSystem);
require("expect-even-more-jest");
const yafs_1 = require("yafs");
const path = __importStar(require("path"));
const SystemError = requireModule("system-error");
describe(`test-dotnet-logic`, () => {
    describe(`testOneDotNetCoreProject`, () => {
        beforeEach(() => {
            fakeSystem.mockImplementation((exe, args, options) => realSystem(exe, args, options));
            const hax = fakeSystem;
            hax.isError = (arg) => arg instanceof SystemError;
            hax.isSystemError = hax.isError;
        });
        const { testOneDotNetCoreProject } = requireModule("test-dotnet-logic");
        it(`should test the project`, async () => {
            // Arrange
            spyOn(console, "log");
            const project = await findProject("Project1.Tests"), testResults = {
                quackersEnabled: true,
                failed: 0,
                skipped: 0,
                failureSummary: [],
                slowSummary: [],
                started: 0,
                passed: 0,
                fullLog: []
            };
            // Act
            const result = await testOneDotNetCoreProject(project, "Debug", "normal", testResults, true, true, true);
            // Assert
            // tests below depend on output from
            if (result.exitCode !== 0) {
                console.warn(result.stdout.join("\n"));
            }
            expect(result.exitCode)
                .toEqual(0);
            // assumes the standard zarro log prefix of ::
            expect(result.stdout.find(line => line.match(/:quackers_log:total:\s+\d+/i))).toExist();
            expect(result.stdout.find(line => line.match(/:quackers_log:passed:\s+\d+/i))).toExist();
            const args = fakeSystem.mock.calls[0];
            let nextIsVerbosity = false;
            for (const arg of args) {
                if (arg === "--verbosity") {
                    nextIsVerbosity = true;
                    continue;
                }
                if (!nextIsVerbosity) {
                    continue;
                }
                expect(arg)
                    .toEqual("quiet");
                break;
            }
        }, 30000);
    });
    describe(`testAsDotNetCore`, () => {
        const { testAsDotNetCore } = requireModule("test-dotnet-logic");
        beforeEach(() => {
            fakeSystem.mockImplementation((exe, args, options) => realSystem(exe, args, options));
            const hax = fakeSystem;
            hax.isError = (arg) => arg instanceof SystemError;
            hax.isSystemError = hax.isError;
        });
        it(`should report the correct totals`, async () => {
            // Arrange
            process.env.FORCE_TEST_FAILURE = "1";
            process.env.DOTNET_TEST_REBUILD = "1";
            const stdout = [];
            const stderr = [];
            const originalLog = console.log.bind(console);
            const originalError = console.error.bind(console);
            spyOn(console, "log").and.callFake((line) => stdout.push(...line.split("\n").map(l => l.replace(/\r$/, ""))));
            spyOn(console, "error").and.callFake((line) => stderr.push(line));
            const project1 = await findProject("Project1.Tests");
            const project2 = await findProject("Project2.Tests");
            const expected = {
                total: 6,
                passed: 3,
                failed: 2,
                skipped: 1
            };
            // Act
            try {
                await testAsDotNetCore("Debug", [project1, project2]);
            }
            catch (e) {
                // suppress - test _should_ throw if there are failures
            }
            // Assert
            let inSummary = false;
            const results = {
                total: -1,
                passed: -1,
                failed: -1,
                skipped: -1
            };
            // originalLog("--- start full stdout dump ---");
            // originalLog(stdout.join("\n"));
            // originalLog("--- end full stdout dump ---");
            for (const line of stdout) {
                if (line.toLowerCase().includes("test results")) {
                    inSummary = true;
                    continue;
                }
                if (!inSummary) {
                    continue;
                }
                if (tryParse(line, passedRe, (i) => results.passed = i)) {
                    continue;
                }
                if (tryParse(line, totalRe, (i) => results.total = i)) {
                    continue;
                }
                if (tryParse(line, skippedRe, (i) => results.skipped = i)) {
                    continue;
                }
                tryParse(line, failedRe, (i) => results.failed = i);
            }
            expect(results)
                .toEqual(expected);
        }, 6000000);
    });
    const passedRe = /^\s*passed:\s*(?<value>\d+)\s*$/i;
    const totalRe = /^\s*total:\s*(?<value>\d+)\s*$/i;
    const failedRe = /^\s*failed:\s*(?<value>\d+)\s*$/i;
    const skippedRe = /^\s*skipped:\s*(?<value>\d+)\s*$/i;
    function tryParse(line, re, callback) {
        const match = line.match(re);
        if (!match || !match.groups) {
            return false;
        }
        callback(parseInt(match.groups["value"]));
        return true;
    }
    async function findProject(name) {
        const basedir = path.dirname(path.dirname(path.dirname(__dirname)));
        const matches = await (0, yafs_1.ls)(basedir, {
            entities: yafs_1.FsEntities.files,
            recurse: true,
            match: new RegExp(`${name}\\.csproj$`),
            fullPaths: true
        });
        const result = matches[0];
        if (!result) {
            throw new Error(`Can't find project: '${name}' under '${basedir}'`);
        }
        return matches[0];
    }
    afterAll(async () => {
        // await Sandbox.destroyAll();
    });
});
