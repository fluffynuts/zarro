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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const scriptPath = path.resolve(__dirname, "../../.github/scripts/next-release-version.js");
const { computeNextVersion, parsePublishedVersions } = require("../../.github/scripts/next-release-version");
describe(`next-release-version`, () => {
    describe(`computeNextVersion`, () => {
        describe(`beta: keep major.minor, increment patch`, () => {
            it(`should increment the patch of the highest published version`, () => {
                // Arrange
                // Act
                const result = computeNextVersion({
                    kind: "beta",
                    packageVersion: "1.217.0",
                    publishedVersions: ["1.216.0", "1.216.1", "1.217.0"]
                });
                // Assert
                expect(result)
                    .toEqual("1.217.1");
            });
            it(`should keep counting up through earlier betas`, () => {
                // Arrange
                // Act
                const result = computeNextVersion({
                    kind: "beta",
                    packageVersion: "1.217.0",
                    publishedVersions: ["1.217.0", "1.217.1", "1.217.2"]
                });
                // Assert
                expect(result)
                    .toEqual("1.217.3");
            });
            it(`should not depend on the order of the published versions`, () => {
                // Arrange
                // Act
                const result = computeNextVersion({
                    kind: "beta",
                    packageVersion: "1.217.0",
                    publishedVersions: ["1.217.2", "1.9.0", "1.217.0", "1.217.1"]
                });
                // Assert
                expect(result)
                    .toEqual("1.217.3");
            });
            it(`should compare numerically, not as strings`, () => {
                // Arrange
                // Act
                const result = computeNextVersion({
                    kind: "beta",
                    packageVersion: "1.9.0",
                    publishedVersions: ["1.9.0", "1.10.0", "1.100.0"]
                });
                // Assert
                expect(result)
                    .toEqual("1.100.1");
            });
        });
        describe(`stable: keep major, increment minor, reset patch`, () => {
            it(`should increment the minor of the highest published version`, () => {
                // Arrange
                // Act
                const result = computeNextVersion({
                    kind: "stable",
                    packageVersion: "1.217.0",
                    publishedVersions: ["1.216.0", "1.216.1", "1.217.0"]
                });
                // Assert
                expect(result)
                    .toEqual("1.218.0");
            });
            it(`should move on from betas of the current minor`, () => {
                // Arrange
                // Act
                const result = computeNextVersion({
                    kind: "stable",
                    packageVersion: "1.217.0",
                    publishedVersions: ["1.217.0", "1.217.1", "1.217.2"]
                });
                // Assert
                expect(result)
                    .toEqual("1.218.0");
            });
        });
        describe(`the base version`, () => {
            it(`should use package.json when it is ahead of what is published`, () => {
                // Arrange
                // Act
                const beta = computeNextVersion({
                    kind: "beta",
                    packageVersion: "1.230.0",
                    publishedVersions: ["1.217.0"]
                });
                const stable = computeNextVersion({
                    kind: "stable",
                    packageVersion: "1.230.0",
                    publishedVersions: ["1.217.0"]
                });
                // Assert
                expect(beta)
                    .toEqual("1.230.1");
                expect(stable)
                    .toEqual("1.231.0");
            });
            it(`should work when nothing is published yet`, () => {
                // Arrange
                // Act
                const result = computeNextVersion({
                    kind: "beta",
                    packageVersion: "1.0.0",
                    publishedVersions: []
                });
                // Assert
                expect(result)
                    .toEqual("1.0.1");
            });
            it(`should keep the current major`, () => {
                // Arrange
                // Act
                const beta = computeNextVersion({
                    kind: "beta",
                    packageVersion: "2.3.4",
                    publishedVersions: ["2.3.4", "1.999.0"]
                });
                const stable = computeNextVersion({
                    kind: "stable",
                    packageVersion: "2.3.4",
                    publishedVersions: ["2.3.4", "1.999.0"]
                });
                // Assert
                expect(beta)
                    .toEqual("2.3.5");
                expect(stable)
                    .toEqual("2.4.0");
            });
            it(`should ignore pre-release versions and unparseable entries when finding the highest`, () => {
                // Arrange
                // Act
                const result = computeNextVersion({
                    kind: "beta",
                    packageVersion: "1.217.0",
                    publishedVersions: ["1.217.0", "2.0.0-rc.1", "not-a-version", ""]
                });
                // Assert
                expect(result)
                    .toEqual("1.217.1");
            });
        });
        describe(`never producing an already-published version`, () => {
            const published = ["1.216.0", "1.216.1", "1.217.0", "1.217.1", "1.218.0"];
            for (const kind of ["beta", "stable"]) {
                for (const packageVersion of ["1.0.0", "1.216.5", "1.218.0", "1.300.0"]) {
                    it(`${kind} from package.json ${packageVersion}`, () => {
                        // Arrange
                        // Act
                        const result = computeNextVersion({ kind, packageVersion, publishedVersions: published });
                        // Assert
                        expect(published)
                            .not.toContain(result);
                    });
                }
            }
        });
        describe(`bad input`, () => {
            it(`should throw for an unknown kind`, () => {
                // Arrange
                // Act
                expect(() => computeNextVersion({
                    kind: "gamma",
                    packageVersion: "1.0.0",
                    publishedVersions: []
                })).toThrow(/kind/i);
                // Assert
            });
            it(`should throw when the package.json version is not valid semver`, () => {
                // Arrange
                // Act
                expect(() => computeNextVersion({
                    kind: "beta",
                    packageVersion: "banana",
                    publishedVersions: []
                })).toThrow(/package.*version/i);
                // Assert
            });
        });
    });
    describe(`parsePublishedVersions (the output of npm view <pkg> versions --json)`, () => {
        it(`should parse an array`, () => {
            // Arrange
            // Act
            const result = parsePublishedVersions(`[ "1.0.0", "1.1.0" ]`);
            // Assert
            expect(result)
                .toEqual(["1.0.0", "1.1.0"]);
        });
        it(`should parse the bare string npm prints when only one version exists`, () => {
            // Arrange
            // Act
            const result = parsePublishedVersions(`"1.0.0"`);
            // Assert
            expect(result)
                .toEqual(["1.0.0"]);
        });
        it(`should throw, not return nothing, when the text is empty or not JSON`, () => {
            // Arrange
            // Act
            expect(() => parsePublishedVersions("")).toThrow(/published versions/i);
            expect(() => parsePublishedVersions("<html>")).toThrow(/published versions/i);
            // Assert
        });
    });
    describe(`command line`, () => {
        async function run(kind, packageVersion, published) {
            const sandbox = await filesystem_sandbox_1.Sandbox.create(), packageJson = await sandbox.writeFile("package.json", JSON.stringify({ name: "x", version: packageVersion })), publishedFile = await sandbox.writeFile("published.json", published);
            return (0, child_process_1.spawnSync)("node", [scriptPath, kind, packageJson, publishedFile], { encoding: "utf8" });
        }
        afterAll(async () => {
            await filesystem_sandbox_1.Sandbox.destroyAll();
        });
        it(`should print only the next version on stdout`, async () => {
            // Arrange
            // Act
            const result = await run("beta", "1.217.0", `[ "1.217.0", "1.217.1" ]`);
            // Assert
            expect(result.status)
                .toEqual(0);
            expect(result.stdout)
                .toEqual("1.217.2\n");
        });
        it(`should exit non-zero with a message on stderr for a bad kind`, async () => {
            // Arrange
            // Act
            const result = await run("nope", "1.217.0", `[]`);
            // Assert
            expect(result.status)
                .not.toEqual(0);
            expect(result.stdout)
                .toEqual("");
            expect(result.stderr)
                .toMatch(/kind/i);
        });
        it(`should exit non-zero when the published versions can't be read`, async () => {
            // Arrange
            // Act
            const result = await run("beta", "1.217.0", ``);
            // Assert
            expect(result.status)
                .not.toEqual(0);
            expect(result.stderr)
                .toMatch(/published versions/i);
        });
    });
});
