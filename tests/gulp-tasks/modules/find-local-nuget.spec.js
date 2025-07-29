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
const filesystem_sandbox_1 = require("filesystem-sandbox");
const path = __importStar(require("path"));
const yafs_1 = require("yafs");
const run_locked_1 = require("../../test-helpers/run-locked");
const should_skip_slow_network_tests_1 = require("../../test-helpers/should-skip-slow-network-tests");
const spy_on_console_1 = require("../../test-helpers/spy-on-console");
if ((0, should_skip_slow_network_tests_1.shouldSkipSlowNetworkTests)()) {
    describe(`find-local-nuget`, () => {
        it(`skipping tests`, async () => {
            // Arrange
            // Act
            expect(true).toBeTrue();
            // Assert
        });
    });
}
else {
    describe(`find-local-nuget`, () => {
        const findLocalNuget = requireModule("find-local-nuget");
        const os = require("os"), isWindows = os.platform() === "win32";
        beforeAll(() => {
            process.env.SUPPRESS_DOWNLOAD_PROGRESS = "1";
        });
        it(`should download nuget.exe to the build tools folder`, async () => {
            await (0, run_locked_1.withLockedNuget)(async () => {
                // Arrange
                spyOn(console, "log");
                spyOn(console, "error");
                const sandbox = await filesystem_sandbox_1.Sandbox.create();
                process.env.BUILD_TOOLS_FOLDER = sandbox.path;
                // Act
                const result = await findLocalNuget();
                // Assert
                const expectedExecutable = isWindows
                    ? "nuget.exe"
                    : "nuget";
                expect(result.toLowerCase())
                    .toEqual(path.join(sandbox.path, expectedExecutable).toLowerCase());
                const contents = await (0, yafs_1.ls)(sandbox.path, {
                    entities: yafs_1.FsEntities.files,
                    recurse: false,
                    fullPaths: false
                });
                expect(contents)
                    .toContain("nuget.exe");
            });
        });
        it(`should be able to install nuget package in dir via resolved nuget path`, async () => {
            await (0, run_locked_1.withLockedNuget)(async () => {
                (0, spy_on_console_1.spyOnConsole)();
                const system = requireModule("system");
                // Arrange
                spyOn(console, "log");
                spyOn(console, "error");
                const sandbox = await filesystem_sandbox_1.Sandbox.create(), toolsFolder = await sandbox.mkdir("build-tools");
                process.env.BUILD_TOOLS_FOLDER = toolsFolder;
                // Act
                const nuget = await findLocalNuget();
                await sandbox.run(async () => {
                    await system(nuget, ["install", "PeanutButter.TempDb.Runner"]);
                });
                // Assert
                const dirs = await (0, yafs_1.ls)(sandbox.path, { entities: yafs_1.FsEntities.folders });
                expect(dirs.find(o => o.indexOf("PeanutButter.TempDb.Runner") > -1))
                    .not.toBeUndefined();
            });
        });
        afterAll(async () => {
            try {
                await filesystem_sandbox_1.Sandbox.destroyAll();
            }
            catch (e) {
                // suppress
            }
        });
    });
}
