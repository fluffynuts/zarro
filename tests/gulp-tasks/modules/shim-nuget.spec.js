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
const yafs_1 = require("yafs");
const path = __importStar(require("path"));
describe(`shim-nuget`, () => {
    const isWindows = requireModule("is-windows"), findLocalNuget = requireModule("find-local-nuget"), sut = requireModule("shim-nuget");
    if (isWindows()) {
        describe(`on windows`, () => {
            it(`should return the path provided`, async () => {
                // Arrange
                const sandbox = await filesystem_sandbox_1.Sandbox.create(), nugetPath = await sandbox.writeFile("nuget.exe", "");
                // Act
                const result = sut(nugetPath);
                // Assert
                expect(result)
                    .toEqual(nugetPath);
            });
        });
    }
    else {
        describe(`on !windows`, () => {
            it(`should return the shim when given the .exe`, async () => {
                // Arrange
                const sandbox = await filesystem_sandbox_1.Sandbox.create(), localNuget = await findLocalNuget(), localNugetFolder = path.dirname(localNuget), localNugetBinary = path.join(localNugetFolder, "nuget.exe"), sandboxNugetBinary = sandbox.fullPathFor("nuget.exe"), sandboxShim = sandbox.fullPathFor("nuget");
                expect(localNugetBinary)
                    .toBeFile();
                await (0, yafs_1.copyFile)(localNugetBinary, sandboxNugetBinary);
                // Act
                const result = sut(sandboxNugetBinary);
                // Assert
                expect(result)
                    .toEqual(sandboxShim);
                const contents = await (0, yafs_1.readTextFile)(result);
                expect(contents.indexOf("#!/bin/bash"))
                    .toEqual(0);
                expect(contents)
                    .toContain("mono");
                expect(contents)
                    .toContain("$(dirname $0)/nuget.exe");
            });
        });
    }
});
