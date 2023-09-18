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
describe(`download-nuget`, () => {
    const downloadNuget = requireModule("download-nuget");
    const logger = requireModule("log");
    it(`should be a function`, async () => {
        // Arrange
        // Act
        expect(downloadNuget)
            .toBeFunction();
        // Assert
    });
    // this is an integration test, to prove that the download works
    // -> it's dependent on nuget.org and a working network
    it(`should download nuget.exe to the target folder without feedback`, async () => {
        // Arrange
        let progressCalls = 0;
        spyOn(console, "log").and.callFake((...args) => {
            if (`${args[0]}`.includes(" of ")) {
                progressCalls++;
            }
        });
        spyOn(process.stdout, "write").and.callFake((...args) => {
            if (`${args[0]}`.includes(" of ")) {
                progressCalls++;
            }
        });
        logger.setThreshold(logger.LogLevels.Info);
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), expected = path.join(sandbox.path, "nuget.exe");
        // Act
        await downloadNuget(sandbox.path, true);
        // Assert
        expect(await (0, yafs_1.fileExists)(expected))
            .toBeTrue();
        expect(progressCalls)
            .toEqual(0);
    });
    afterEach(async () => {
        await filesystem_sandbox_1.Sandbox.destroyAll();
    });
});
