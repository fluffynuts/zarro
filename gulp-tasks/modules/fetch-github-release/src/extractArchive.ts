import * as fs from "fs";
import * as path from "path";
import * as tar from "tar";
import AdmZip = require("adm-zip");

type ArchiveFormat = "zip" | "tar";

/**
 * Extracts a release archive (zip, tar.gz or plain tar) into the destination.
 * Resolves the extracted entries' paths, relative to the destination.
 *
 * Strict on purpose: an archive which tries to write outside the destination, or to leave a symbolic
 * link pointing outside it, is refused (rejects) rather than quietly tidied up, and so is a file
 * which isn't an archive we can read.
 */
export async function extractArchive(
  archivePath: string,
  destination: string
): Promise<string[]> {
  const format = detectFormat(archivePath);
  if (format === undefined) {
    throw new Error(
      `unsupported archive format: ${ path.basename(archivePath) } is neither a zip nor a tar(.gz) archive`
    );
  }
  fs.mkdirSync(destination, { recursive: true });
  return format === "zip"
    ? extractZip(archivePath, destination)
    : extractTar(archivePath, destination);
}

function detectFormat(archivePath: string): ArchiveFormat | undefined {
  const
    header = Buffer.alloc(512),
    fd = fs.openSync(archivePath, "r");
  let read: number;
  try {
    read = fs.readSync(fd, header, 0, header.length, 0);
  } finally {
    fs.closeSync(fd);
  }
  const isZip = read >= 4 && header[0] === 0x50 && header[1] === 0x4b &&
    (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07);
  if (isZip) {
    return "zip";
  }
  const isGzip = read >= 2 && header[0] === 0x1f && header[1] === 0x8b;
  const isPlainTar = read >= 262 && header.toString("latin1", 257, 262) === "ustar";
  return isGzip || isPlainTar
    ? "tar"
    : undefined;
}

async function extractTar(archivePath: string, destination: string): Promise<string[]> {
  const extracted: string[] = [];
  await tar.x({
    file: archivePath,
    cwd: destination,
    // turns every warning, eg an entry containing .. or an absolute link target, into an error
    strict: true,
    onReadEntry: entry => {
      extracted.push(entry.path);
    }
  });
  return extracted;
}

function extractZip(archivePath: string, destination: string): string[] {
  const
    root = path.resolve(destination),
    entries = new AdmZip(archivePath).getEntries();
  // check every entry before writing any of them
  const targets = entries.map(entry => {
    const target = path.resolve(root, entry.entryName);
    if (path.isAbsolute(entry.entryName) || !isInside(root, target)) {
      throw new Error(`invalid relative path: ${ entry.entryName }`);
    }
    if (isSymbolicLink(entry)) {
      throw new Error(`refusing to extract symbolic link: ${ entry.entryName }`);
    }
    return target;
  });
  entries.forEach((entry, i) => {
    const target = targets[i];
    if (entry.isDirectory) {
      fs.mkdirSync(target, { recursive: true });
      return;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, entry.getData());
    fs.chmodSync(target, permissionsOf(entry));
  });
  return entries.map(entry => entry.entryName);
}

function isInside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative !== ".." &&
    !relative.startsWith(`..${ path.sep }`) &&
    !path.isAbsolute(relative);
}

function unixModeOf(entry: AdmZip.IZipEntry): number {
  return (entry.attr >>> 16) & 0xffff;
}

function isSymbolicLink(entry: AdmZip.IZipEntry): boolean {
  return (unixModeOf(entry) & 0o170000) === 0o120000;
}

function permissionsOf(entry: AdmZip.IZipEntry): number {
  // zips made on Windows carry no unix permissions
  return (unixModeOf(entry) & 0o777) || 0o644;
}
