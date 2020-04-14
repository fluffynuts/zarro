import EventEmitter = NodeJS.EventEmitter;

declare function requireModule<T>(module: string): T;
declare type VoidVoid = () => void;
declare type GulpCallback =
  (() => Promise<any> | EventEmitter) | ((done: VoidVoid) => Promise<any> | EventEmitter)

interface GulpWithHelp {
  task(name: string, callback: GulpCallback): void;
  task(name: string, dependencies: string[], callback: GulpCallback): void;
}

interface Env {
  resolve(...names: string[]): string;
  resolveArray(name: string): string[];
  resolveArray(name: string, delimiter: string): string[];
  resolveNumber(name: string): number;
  resolveFlag(name: string): boolean;
  associate(varName: string | string[], tasks: string | string[]): void;
}

// // TODO: figure out why importing this from the fs module causes other
// // stuff in this file to break;
interface FsStatsBase<T> {
  isFile(): boolean;
  isDirectory(): boolean;
  isBlockDevice(): boolean;
  isCharacterDevice(): boolean;
  isSymbolicLink(): boolean;
  isFIFO(): boolean;
  isSocket(): boolean;

  dev: T;
  ino: T;
  mode: T;
  nlink: T;
  uid: T;
  gid: T;
  rdev: T;
  size: T;
  blksize: T;
  blocks: T;
  atimeMs: T;
  mtimeMs: T;
  ctimeMs: T;
  birthtimeMs: T;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
}
interface FsStats extends FsStatsBase<number>{}
declare type StatFunction = (path: string) => Promise<FsStats | null>

declare type ReadTextFile = (path: string) => Promise<string>;
declare type WriteTextFile = (path: string, data: string, options?: { encoding?: string | null, mode?: string | number, flag?: string | number } | string | null) => Promise<void>

declare type IncrementVersion = (version: string, strategy: string, zeroLowerOrder: boolean)
  => string;
declare type ReadPackageVersion = (packageJsonPath?: string) => string;

declare type GitTag = (tag: string, comment?: string) => Promise<void>;
declare type GitPush = (dryRun?: boolean, quiet?: boolean) => Promise<void>;
declare type GitPushTags = (dryRun?: boolean) => Promise<void>;

type StdioOptions = "pipe" | "ignore" | "inherit" |
  Array<("pipe" | "ipc" | "ignore" | "inherit" | any | number | null | undefined)>;

declare type BufferConsumer = (data: Buffer) => void;
declare type ProcessIO = string | BufferConsumer

interface SpawnOptions {
  windowsHide?: boolean;
  timeout?: number;
  argv0?: string;
  stdio?: StdioOptions;
  shell?: boolean | string;
  windowsVerbatimArguments?: boolean;

  uid?: number;
  gid?: number;
  cwd?: string;
  env?: NodeJS.ProcessEnv;

  stdout: ProcessIO;
  stderr: ProcessIO;

  detached?: boolean;
}

declare type Spawn = (program: string, args: string[], options?: SpawnOptions)
  => Promise<number>;

