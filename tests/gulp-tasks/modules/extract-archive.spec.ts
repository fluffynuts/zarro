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

  async function createLayout(archive: Buffer, archiveName: string) {
    const
      sandbox = await Sandbox.create(),
      archivePath = sandbox.fullPathFor(archiveName),
      destination = sandbox.fullPathFor("out"),
      outside = sandbox.fullPathFor("outside");
    fs.writeFileSync(archivePath, archive);
    fs.mkdirSync(destination);
    fs.mkdirSync(outside);
    return { sandbox, archivePath, destination, outside };
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
