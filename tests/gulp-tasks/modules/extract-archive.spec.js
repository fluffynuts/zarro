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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const filesystem_sandbox_1 = require("filesystem-sandbox");
const archives_1 = require("../../test-helpers/archives");
const extractArchive_1 = require("../../../gulp-tasks/modules/fetch-github-release/src/extractArchive");
describe(`extractArchive`, () => {
    afterAll(async () => {
        await filesystem_sandbox_1.Sandbox.destroyAll();
    });
    async function createLayout(archive, archiveName) {
        const sandbox = await filesystem_sandbox_1.Sandbox.create(), archivePath = sandbox.fullPathFor(archiveName), destination = sandbox.fullPathFor("out"), outside = sandbox.fullPathFor("outside");
        fs.writeFileSync(archivePath, archive);
        fs.mkdirSync(destination);
        fs.mkdirSync(outside);
        return { sandbox, archivePath, destination, outside };
    }
    const formats = [
        ["tar.gz", "release.tar.gz", archives_1.makeTarGz],
        ["zip", "release.zip", archives_1.makeZip]
    ];
    const release = [
        { name: "top.txt", data: "top level" },
        { name: "docs/readme.txt", data: "the readme" },
        { name: "bin/tool", data: "#!/bin/sh\necho hi\n", mode: 0o755 }
    ];
    for (const [format, archiveName, make] of formats) {
        describe(format, () => {
            it(`should extract the files, with their content, into the destination`, async () => {
                // Arrange
                const { archivePath, destination } = await createLayout(make(release), archiveName);
                // Act
                await (0, extractArchive_1.extractArchive)(archivePath, destination);
                // Assert
                expect(fs.readFileSync(path.join(destination, "top.txt"), "utf8"))
                    .toEqual("top level");
                expect(fs.readFileSync(path.join(destination, "docs", "readme.txt"), "utf8"))
                    .toEqual("the readme");
                expect(fs.readFileSync(path.join(destination, "bin", "tool"), "utf8"))
                    .toEqual("#!/bin/sh\necho hi\n");
            });
            it(`should resolve the extracted files' paths, relative to the destination`, async () => {
                // Arrange
                const { archivePath, destination } = await createLayout(make(release), archiveName);
                // Act
                const result = await (0, extractArchive_1.extractArchive)(archivePath, destination);
                // Assert
                expect(result)
                    .toContain("top.txt");
                expect(result)
                    .toContain("docs/readme.txt");
                expect(result)
                    .toContain("bin/tool");
            });
            it(`should keep the executable bit of executables (and not add it to other files)`, async () => {
                // Arrange
                const { archivePath, destination } = await createLayout(make(release), archiveName);
                // Act
                await (0, extractArchive_1.extractArchive)(archivePath, destination);
                // Assert
                const mode = (file) => fs.statSync(path.join(destination, file)).mode;
                expect(mode("bin/tool") & 0o100)
                    .not.toEqual(0);
                expect(mode("top.txt") & 0o111)
                    .toEqual(0);
            });
            it(`should refuse an entry which climbs out of the destination`, async () => {
                // Arrange
                const entries = [
                    { name: "ok.txt", data: "fine" },
                    { name: "../escaped.txt", data: "gotcha" }
                ], { sandbox, archivePath, destination } = await createLayout(make(entries), archiveName);
                // Act
                await expect((0, extractArchive_1.extractArchive)(archivePath, destination))
                    .rejects.toBeDefined();
                // Assert
                expect(fs.existsSync(sandbox.fullPathFor("escaped.txt")))
                    .toBeFalse();
            });
        });
    }
});
