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
const filesystem_sandbox_1 = require("filesystem-sandbox");
const expect_even_more_jest_1 = require("expect-even-more-jest");
const realSystem = require("system-wrapper");
const fakeSystem = Object.assign({}, realSystem);
jest.doMock("../../../gulp-tasks/modules/system", () => fakeSystem);
jest.doMock("system-wrapper", () => fakeSystem);
require("expect-even-more-jest");
const yafs_1 = require("yafs");
const path = __importStar(require("path"));
const should_skip_slow_network_tests_1 = require("../../test-helpers/should-skip-slow-network-tests");
const system_wrapper_1 = require("system-wrapper");
if ((0, should_skip_slow_network_tests_1.shouldSkipSlowNetworkTests)()) {
    const ansiColors = requireModule("ansi-colors");
    describe(`test-dotnet-logic`, () => {
        it(`skipping tests`, async () => {
            // Arrange
            // Act
            expect(true).toBeTrue();
            // Assert
        });
    });
}
else {
    describe(`test-dotnet-logic`, () => {
        const { spyOn } = jest;
        describe(`testOneDotNetCoreProject`, () => {
            beforeEach(() => {
                const isError = fakeSystem.system.isError;
                const isResult = fakeSystem.system.isResult;
                spyOn(fakeSystem, "system");
                const hax = fakeSystem;
                hax.system.isError = isError;
                hax.system.isResult = isResult;
            });
            const { testOneDotNetCoreProject } = requireModule("test-dotnet-logic");
            it(`should test the project`, async () => {
                // Arrange
                process.env.FORCE_TEST_FAILURE = "0";
                spyOn(console, "log").mockImplementation((...args) => {
                });
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
                if (result.exitCode !== 0) {
                    console.warn(result.stdout.join("\n"));
                }
                expect(result.exitCode)
                    .toEqual(0);
                // assumes the standard zarro log prefix of ::
                expect(result.stdout.find(line => line.match(/:quackers_log:total:\s+\d+/i))).toExist();
                expect(result.stdout.find(line => line.match(/:quackers_log:passed:\s+\d+/i))).toExist();
                const args = fakeSystem.system.mock.calls[0];
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
            }, 90000);
        });
        describe(`testAsDotNetCore`, () => {
            const { testAsDotNetCore } = requireModule("test-dotnet-logic");
            beforeEach(() => {
                const isError = fakeSystem.system.isError;
                const isResult = fakeSystem.system.isResult;
                spyOn(fakeSystem, "system");
                const hax = fakeSystem;
                hax.system.isError = isError;
                hax.system.isResult = isResult;
            });
            it(`should report the correct totals`, async () => {
                // Arrange
                process.env.FORCE_TEST_FAILURE = "1";
                process.env.DOTNET_TEST_REBUILD = "1";
                const stdout = [];
                const stderr = [];
                const originalError = console.error.bind(console);
                spyOn(console, "log").mockImplementation((line) => stdout.push(...line.split("\n").map(l => l.replace(/\r$/, ""))));
                spyOn(console, "error").mockImplementation((line) => stderr.push(line));
                const project1 = await findProject("Project1.Tests");
                const project2 = await findProject("Project2.Tests");
                const expected = {
                    total: 6,
                    passed: 3,
                    failed: 2,
                    skipped: 1,
                    slow: 1
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
                    skipped: -1,
                    slow: -1
                };
                // originalLog("--- start full stdout dump ---");
                // originalLog(stdout.join("\n"));
                // originalLog("--- end full stdout dump ---");
                let foundTotal = false;
                let foundPassed = false;
                let foundFailed = false;
                let foundSkipped = false;
                let foundSlow = false;
                let foundTotals = false;
                const parseLog = [];
                for (const line of stdout) {
                    if (line.toLowerCase().includes("overall result:")) {
                        inSummary = true;
                        continue;
                    }
                    if (!inSummary) {
                        continue;
                    }
                    foundTotal || (foundTotal = tryParse(line, totalRe, (i) => results.total = i, parseLog));
                    foundPassed || (foundPassed = tryParse(line, passedRe, (i) => results.passed = i, parseLog));
                    foundFailed || (foundFailed = tryParse(line, failedRe, (i) => results.failed = i, parseLog));
                    foundSkipped || (foundSkipped = tryParse(line, skippedRe, (i) => results.skipped = i, parseLog));
                    foundSlow || (foundSlow = tryParse(line, slowRe, (i) => results.slow = i, parseLog));
                    foundTotals = foundPassed &&
                        foundTotal &&
                        foundSkipped &&
                        foundFailed &&
                        foundSlow;
                    if (foundTotals) {
                        inSummary = false;
                        break;
                    }
                }
                if (!foundTotals || results.total < 1) {
                    originalError("no totals found");
                    originalError(`[raw stdout]\n${stdout.join("\n")}`);
                    originalError(`\n[parse logs]\n${parseLog.join("\n")}`);
                }
                expect(results)
                    .toEqual(expected);
            }, 90000);
        });
        describe(`logTestSuiteTimes`, () => {
            const { logTestSuiteTimes } = requireModule("test-dotnet-logic");
            it(`producing a sorted list of test runtimes`, async () => {
                // Arrange
                const result1 = system_wrapper_1.SystemResult.create()
                    .withExe("dotnet")
                    .withArgs(["test", "project1.dll"])
                    .build(), result2 = system_wrapper_1.SystemResult.create()
                    .withExe("dotnet")
                    .withArgs(["test", "project2.dll"])
                    .build(), fail = new system_wrapper_1.SystemError("fail", "dotnet", ["test", "failed.dll"], 2, [], [], Date.now() - 5000), collected = [];
                await (0, expect_even_more_jest_1.sleep)(100);
                result1.complete();
                await (0, expect_even_more_jest_1.sleep)(100);
                result2.complete();
                spyOn(console, "log")
                    .mockReturnValue();
                const yellow = jest.fn()
                    .mockImplementation(s => {
                    collected.push(s);
                    return s;
                });
                // Act
                logTestSuiteTimes([result1, result2, fail], yellow);
                // Assert
                expect(collected.length)
                    .toEqual(4);
                expect(collected[0])
                    .toEqual("\nTest suite timings:");
                expect(collected[1].trimStart())
                    .toEqual("failed: 5.0 seconds");
                expect(collected[2].trimStart())
                    .toStartWith("project2:");
                expect(collected[3].trimStart())
                    .toStartWith("project1:");
            });
        });
        describe(`sortTestProjects`, () => {
            const env = requireModule("env"), { sortTestProjects } = requireModule("test-dotnet-logic");
            describe(`when TEST_ORDER env var not set`, () => {
                it(`should not change the order`, async () => {
                    // Arrange
                    const projects = [
                        "bbb.csproj",
                        "aaa.csproj"
                    ], expected = [...projects];
                    process.env.TEST_ORDER = "";
                    // Act
                    const result = sortTestProjects(projects);
                    // Assert
                    expect(result)
                        .toEqual(expected);
                });
            });
            describe(`when TEST_ORDER env var set`, () => {
                it(`should prioritise according to the var`, async () => {
                    // Arrange
                    const projects = [
                        "aaa.csproj",
                        "bbb.csproj",
                        "ccc.csproj"
                    ];
                    process.env.TEST_ORDER = "bbb,ccc";
                    const expected = [
                        "bbb.csproj",
                        "ccc.csproj",
                        "aaa.csproj"
                    ];
                    // Act
                    const result = sortTestProjects(projects);
                    // Assert
                    expect(result)
                        .toEqual(expected);
                });
            });
        });
        const totalRe = /\s*test count:\s*(?<value>\d+)/i;
        const passedRe = /\s*passed:\s*(?<value>\d+)/i;
        const failedRe = /\s*failed:\s*(?<value>\d+)/i;
        const skippedRe = /\s*skipped:\s*(?<value>\d+)/i;
        const slowRe = /\s*slow:\s*(?<value>\d+)/i;
        function tryParse(line, re, callback, log) {
            const match = line.match(re);
            if (!match || !match.groups) {
                if (log) {
                    log.push(`no match for ${re.toString()} on line: '${line}'`);
                    log.push(`   ${JSON.stringify(match)}`);
                }
                return false;
            }
            const value = parseInt(match.groups["value"]);
            if (log) {
                log.push(`line '${line}' is a match for ${re.toString()} - calling callback with ${value}`);
            }
            callback(value);
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
            await filesystem_sandbox_1.Sandbox.destroyAll();
        });
    });
}
