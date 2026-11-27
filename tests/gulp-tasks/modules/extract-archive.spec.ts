import "expect-even-more-jest";
import * as fs from "fs";
import * as path from "path";
import { Sandbox } from "filesystem-sandbox";
import { ArchiveEntry, makeTarGz, makeZip } from "../../test-helpers/archives";
import { extractArchive } from "../../../gulp-tasks/modules/fetch-github-release/src/extractArchive";

describe(`extractArchive`, () => {
  afterAll(async () => {
    await Sandbox.destroyAll();
  });

  async function createLayout(
    archive: Buffer | ((outside: string) => Buffer),
    archiveName: string
  ) {
    const
      sandbox = await Sandbox.create(),
      archivePath = sandbox.fullPathFor(archiveName),
      destination = sandbox.fullPathFor("out"),
      outside = sandbox.fullPathFor("outside");
    fs.mkdirSync(destination);
    fs.mkdirSync(outside);
    fs.writeFileSync(archivePath, typeof archive === "function" ? archive(outside) : archive);
    return { sandbox, archivePath, destination, outside };
  }

  function findSymlinksUnder(folder: string): string[] {
    return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
      const full = path.join(folder, entry.name);
      if (entry.isSymbolicLink()) {
        return [ full ];
      }
      return entry.isDirectory() ? findSymlinksUnder(full) : [];
    });
  }

  function isInside(folder: string, target: string) {
    const relative = path.relative(folder, target);
    return relative !== ".." && !relative.startsWith(`..${ path.sep }`) && !path.isAbsolute(relative);
  }

  const formats: Array<[ string, string, (entries: ArchiveEntry[]) => Buffer ]> = [
    [ "tar.gz", "release.tar.gz", makeTarGz ],
    [ "zip", "release.zip", makeZip ]
  ];

  const release: ArchiveEntry[] = [
    { name: "top.txt", data: "top level" },
    { name: "docs/readme.txt", data: "the readme" },
    { name: "bin/tool", data: "#!/bin/sh\necho hi\n", mode: 0o755 }
  ];

  it(`should reject, not silently return nothing, for a file which is neither a zip nor a tar archive`, async () => {
    // Arrange
    const { archivePath, destination } = await createLayout(
      Buffer.from("this is not an archive"),
      "release.bin"
    );
    // Act
    await expect(extractArchive(archivePath, destination))
      .rejects.toThrow(/archive/i);
    // Assert
  });

  it(`should refuse a zip with a symbolic link in it, rather than turn the link into a plain file`, async () => {
    // Arrange
    const { archivePath, destination } = await createLayout(
      makeZip([
        { name: "ok.txt", data: "fine" },
        { name: "latest", symlinkTo: "ok.txt" }
      ]),
      "release.zip"
    );
    // Act
    await expect(extractArchive(archivePath, destination))
      .rejects.toThrow(/symbolic link/i);
    // Assert
    expect(fs.existsSync(path.join(destination, "latest")))
      .toBeFalse();
  });

  for (const [ format, archiveName, make ] of formats) {
    describe(format, () => {
      it(`should extract the files, with their content, into the destination`, async () => {
        // Arrange
        const { archivePath, destination } = await createLayout(make(release), archiveName);
        // Act
        await extractArchive(archivePath, destination);
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
        const result = await extractArchive(archivePath, destination);
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
        await extractArchive(archivePath, destination);
        // Assert
        const mode = (file: string) => fs.statSync(path.join(destination, file)).mode;
        expect(mode("bin/tool") & 0o100)
          .not.toEqual(0);
        expect(mode("top.txt") & 0o111)
          .toEqual(0);
      });

      const linkAttacks: Array<[ string, (outside: string) => string ]> = [
        [ "absolute", outside => outside ],
        [ "relative", () => "../outside" ]
      ];
      for (const [ kind, target ] of linkAttacks) {
        it(`should not leave a symbolic link which points outside the destination (${ kind } target)`, async () => {
          // Arrange
          const
            { archivePath, destination, outside } = await createLayout(
              outsidePath => make([
                { name: "ok.txt", data: "fine" },
                { name: "escape", symlinkTo: target(outsidePath) },
                { name: "escape/pwned.txt", data: "pwned" }
              ]),
              archiveName
            );
          // Act
          // refusing the archive and neutralising the link are both acceptable
          await extractArchive(archivePath, destination).catch(() => undefined);
          // Assert
          for (const link of findSymlinksUnder(destination)) {
            const resolved = path.resolve(path.dirname(link), fs.readlinkSync(link));
            expect(`${ link } -> ${ isInside(destination, resolved) ? "inside" : "OUTSIDE: " + resolved }`)
              .toMatch(/-> inside$/);
          }
          expect(fs.readdirSync(outside))
            .toEqual([]);
        });
      }

      it(`should refuse an entry which climbs out of the destination`, async () => {
        // Arrange
        const
          entries: ArchiveEntry[] = [
            { name: "ok.txt", data: "fine" },
            { name: "../escaped.txt", data: "gotcha" }
          ],
          { sandbox, archivePath, destination } = await createLayout(make(entries), archiveName);
        // Act
        await expect(extractArchive(archivePath, destination))
          .rejects.toBeDefined();
        // Assert
        expect(fs.existsSync(sandbox.fullPathFor("escaped.txt")))
          .toBeFalse();
      });
    });
  }
});
