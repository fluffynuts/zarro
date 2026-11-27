import * as zlib from "zlib";

// Minimal, dependency-free writers for tar.gz and zip archives. They exist so that tests can build
// exactly the archives they need, including the malicious ones (entries which climb out of the
// destination, symbolic links) which real archive tools won't produce.

export interface ArchiveEntry {
  name: string;
  data?: string | Buffer;
  // unix permission bits, eg 0o755
  mode?: number;
  directory?: boolean;
  // makes the entry a symbolic link to this target
  symlinkTo?: string;
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function bufferOf(entry: ArchiveEntry): Buffer {
  if (entry.symlinkTo !== undefined) {
    return Buffer.from(entry.symlinkTo);
  }
  const data = entry.data ?? "";
  return Buffer.isBuffer(data) ? data : Buffer.from(data);
}

function tarHeader(entry: ArchiveEntry, size: number): Buffer {
  const header = Buffer.alloc(512);
  const octal = (value: number, length: number) =>
    value.toString(8).padStart(length - 1, "0") + "\0";
  const isDirectory = entry.directory === true;
  const isSymlink = entry.symlinkTo !== undefined;
  const mode = entry.mode ?? (isDirectory ? 0o755 : 0o644);
  header.write(entry.name, 0, 100);
  header.write(octal(mode, 8), 100);
  header.write(octal(0, 8), 108);
  header.write(octal(0, 8), 116);
  header.write(octal(isSymlink || isDirectory ? 0 : size, 12), 124);
  header.write(octal(0, 12), 136);
  header.write("        ", 148); // the checksum is computed as if these were spaces
  header.write(isSymlink ? "2" : isDirectory ? "5" : "0", 156);
  if (isSymlink) {
    header.write(entry.symlinkTo as string, 157, 100);
  }
  header.write("ustar\0", 257);
  header.write("00", 263);
  let checksum = 0;
  for (const byte of header) {
    checksum += byte;
  }
  header.write(checksum.toString(8).padStart(6, "0") + "\0 ", 148);
  return header;
}

export function makeTarGz(entries: ArchiveEntry[]): Buffer {
  const blocks: Buffer[] = [];
  for (const entry of entries) {
    const body = entry.directory || entry.symlinkTo !== undefined
      ? Buffer.alloc(0)
      : bufferOf(entry);
    blocks.push(tarHeader(entry, body.length));
    if (body.length > 0) {
      blocks.push(body, Buffer.alloc((512 - (body.length % 512)) % 512));
    }
  }
  blocks.push(Buffer.alloc(1024));
  return zlib.gzipSync(Buffer.concat(blocks));
}

export function makeZip(entries: ArchiveEntry[]): Buffer {
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const isDirectory = entry.directory === true;
    const isSymlink = entry.symlinkTo !== undefined;
    const name = Buffer.from(isDirectory && !entry.name.endsWith("/") ? `${ entry.name }/` : entry.name);
    const body = isDirectory ? Buffer.alloc(0) : bufferOf(entry);
    const crc = crc32(body);
    const unixType = isSymlink ? 0o120000 : isDirectory ? 0o040000 : 0o100000;
    const unixMode = unixType | (entry.mode ?? (isSymlink ? 0o777 : isDirectory ? 0o755 : 0o644));

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(body.length, 18);
    localHeader.writeUInt32LE(body.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    local.push(localHeader, name, body);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE((3 << 8) | 20, 4); // made by unix, so the mode is in the external attributes
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(body.length, 20);
    centralHeader.writeUInt32LE(body.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt32LE(((unixMode << 16) | (isDirectory ? 0x10 : 0)) >>> 0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    central.push(centralHeader, name);

    offset += localHeader.length + name.length + body.length;
  }
  const centralDirectory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([ ...local, centralDirectory, end ]);
}
