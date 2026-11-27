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
        fs.mkdirSync(destination);
        fs.mkdirSync(outside);
        fs.writeFileSync(archivePath, typeof archive === "function" ? archive(outside) : archive);
        return { sandbox, archivePath, destination, outside };
    }
    function findSymlinksUnder(folder) {
        return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
            const full = path.join(folder, entry.name);
            if (entry.isSymbolicLink()) {
                return [full];
            }
            return entry.isDirectory() ? findSymlinksUnder(full) : [];
        });
    }
    function isInside(folder, target) {
        const relative = path.relative(folder, target);
        return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
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
    it(`should reject, not silently return nothing, for a file which is neither a zip nor a tar archive`, async () => {
        // Arrange
        const { archivePath, destination } = await createLayout(Buffer.from("this is not an archive"), "release.bin");
        // Act
        await expect((0, extractArchive_1.extractArchive)(archivePath, destination))
            .rejects.toThrow(/archive/i);
        // Assert
    });
    it(`should refuse a zip with a symbolic link in it, rather than turn the link into a plain file`, async () => {
        // Arrange
        const { archivePath, destination } = await createLayout((0, archives_1.makeZip)([
            { name: "ok.txt", data: "fine" },
            { name: "latest", symlinkTo: "ok.txt" }
        ]), "release.zip");
        // Act
        await expect((0, extractArchive_1.extractArchive)(archivePath, destination))
            .rejects.toThrow(/symbolic link/i);
        // Assert
        expect(fs.existsSync(path.join(destination, "latest")))
            .toBeFalse();
    });
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
            const linkAttacks = [
                ["absolute", outside => outside],
                ["relative", () => "../outside"]
            ];
            for (const [kind, target] of linkAttacks) {
                it(`should not leave a symbolic link which points outside the destination (${kind} target)`, async () => {
                    // Arrange
                    const { archivePath, destination, outside } = await createLayout(outsidePath => make([
                        { name: "ok.txt", data: "fine" },
                        { name: "escape", symlinkTo: target(outsidePath) },
                        { name: "escape/pwned.txt", data: "pwned" }
                    ]), archiveName);
                    // Act
                    // refusing the archive and neutralising the link are both acceptable
                    await (0, extractArchive_1.extractArchive)(archivePath, destination).catch(() => undefined);
                    // Assert
                    for (const link of findSymlinksUnder(destination)) {
                        const resolved = path.resolve(path.dirname(link), fs.readlinkSync(link));
                        expect(`${link} -> ${isInside(destination, resolved) ? "inside" : "OUTSIDE: " + resolved}`)
                            .toMatch(/-> inside$/);
                    }
                    expect(fs.readdirSync(outside))
                        .toEqual([]);
                });
            }
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
