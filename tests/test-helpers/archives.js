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
exports.makeTarGz = makeTarGz;
exports.makeZip = makeZip;
const zlib = __importStar(require("zlib"));
function crc32(data) {
    let crc = 0xffffffff;
    for (const byte of data) {
        crc ^= byte;
        for (let i = 0; i < 8; i++) {
            crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}
function bufferOf(entry) {
    var _a;
    if (entry.symlinkTo !== undefined) {
        return Buffer.from(entry.symlinkTo);
    }
    const data = (_a = entry.data) !== null && _a !== void 0 ? _a : "";
    return Buffer.isBuffer(data) ? data : Buffer.from(data);
}
function tarHeader(entry, size) {
    var _a;
    const header = Buffer.alloc(512);
    const octal = (value, length) => value.toString(8).padStart(length - 1, "0") + "\0";
    const isDirectory = entry.directory === true;
    const isSymlink = entry.symlinkTo !== undefined;
    const mode = (_a = entry.mode) !== null && _a !== void 0 ? _a : (isDirectory ? 0o755 : 0o644);
    header.write(entry.name, 0, 100);
    header.write(octal(mode, 8), 100);
    header.write(octal(0, 8), 108);
    header.write(octal(0, 8), 116);
    header.write(octal(isSymlink || isDirectory ? 0 : size, 12), 124);
    header.write(octal(0, 12), 136);
    header.write("        ", 148); // the checksum is computed as if these were spaces
    header.write(isSymlink ? "2" : isDirectory ? "5" : "0", 156);
    if (isSymlink) {
        header.write(entry.symlinkTo, 157, 100);
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
function makeTarGz(entries) {
    const blocks = [];
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
function makeZip(entries) {
    var _a;
    const local = [];
    const central = [];
    let offset = 0;
    for (const entry of entries) {
        const isDirectory = entry.directory === true;
        const isSymlink = entry.symlinkTo !== undefined;
        const name = Buffer.from(isDirectory && !entry.name.endsWith("/") ? `${entry.name}/` : entry.name);
        const body = isDirectory ? Buffer.alloc(0) : bufferOf(entry);
        const crc = crc32(body);
        const unixType = isSymlink ? 0o120000 : isDirectory ? 0o040000 : 0o100000;
        const unixMode = unixType | ((_a = entry.mode) !== null && _a !== void 0 ? _a : (isSymlink ? 0o777 : isDirectory ? 0o755 : 0o644));
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
    return Buffer.concat([...local, centralDirectory, end]);
}
