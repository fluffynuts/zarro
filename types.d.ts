// noinspection JSUnusedGlobalSymbols

import * as fs from "fs";
import { Stream, Transform } from "stream";
import ansiColors, { StyleFunction } from "ansi-colors";
import { AlterPackageJsonVersionOptions } from "./gulp-tasks/modules/alter-package-json-version";
import { RimrafOptions } from "./gulp-tasks/modules/rimraf";
import { ExecFileOptionsWithBufferEncoding } from "child_process";
import { IoConsumer, IoHandlers } from "./gulp-tasks/modules/exec";
import { StatsBase } from "fs";
import * as vinyl from "vinyl";

// copied out of @types/fancy-log because imports are being stupid
interface Logger {
  (...args: any[]): Logger;
  dir(...args: any[]): Logger;
  error(...args: any[]): Logger;
  info(...args: any[]): Logger;
  warn(...args: any[]): Logger;
}

interface LogLevels {
  Debug: string;
  Info: string;
  Notice: string;
  Warning: string;
  Error: string;
}

declare enum LogThreshold {
  debug = 1,
  info = 2,
  notice = 3,
  warning = 4,
  error = 5
}

interface ZarroLogger {
  LogLevels: LogLevels;
  threshold: LogThreshold;

  setThreshold(threshold: number | string): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  notice(...args: any[]): void;
  warning(...args: any[]): void;
  error(...args: any[]): void;

  fail(...args: any[]): void;
  ok(...args: any[]): void;
  notice(...args: any[]): void;
  suppressTimestamps(): void;
  showTimestamps(): void;

}

declare global {
  function requireModule<T>(module: string): T;

  type VoidVoid = () => void;
  type AsyncVoidVoid = () => Promise<void>;
  type AsyncVoidFunc<T> = () => Promise<T>;
  type AsyncTVoid<T> = (arg: T) => Promise<void>;
  type OptionsFactory<T> = (file: vinyl.BufferFile) => T | Promise<T>;
  type ErrorReporter = (e: Error) => Promise<void> | void;
  type GulpCallback =
    (() => Promise<any> | NodeJS.EventEmitter) | ((done: VoidVoid) => Promise<any> | NodeJS.EventEmitter)
  type TryDo<T> = (logic: AsyncVoidFunc<T>, retries: number | string, onTransientError?: ErrorReporter, onFinalFailure?: VoidVoid) => Promise<void>;
  type Optional<T> = T | undefined;
  type Nullable<T> = T | null;
  type ResolveNuget = (nugetPath: Optional<string>, errorOnMissing: boolean) => string;
  type FindLocalNuget = () => Promise<string>;

  interface Streamify {
    streamify<T>(
      fn: AsyncTVoid<T>,
      optionsFactory: OptionsFactory<T>,
      pluginName: string,
      operation: string
    ): Transform;
  }

  interface HttpClient {
    download(url: string, target: string): Promise<string>;
    exists(url: string): Promise<boolean>;
  }

  interface HttpClientModule {
    create(
      infoLogFunction?: (s: string) => void,
      debugLogFunction?: (s: string) => void
    ): HttpClient;
  }

  interface GulpWithHelp {
    task(name: string, callback: GulpCallback): void;
    task(name: string, help: string, callback: GulpCallback): void;
    task(name: string, dependencies: string[], callback: GulpCallback): void;

    src(mask: string | string[]): NodeJS.ReadableStream;
    dest(target: string): NodeJS.WritableStream;
  }

  type Gulp = GulpWithHelp;

  type StringMap = (input: string) => string;

  interface Dictionary<TValue> {
    [key: string]: TValue;
  }

  interface Author {
    name: string;
    url: string;
  }

  interface PackageIndex {
    name: string;
    version: string;
    description?: string;
    bin?: Dictionary<string>;
    homepage?: string;
    main?: string;
    scripts?: Dictionary<string>;
    dependencies?: Dictionary<string>;
    devDependencies?: Dictionary<string>;
    files?: string[];
    author: Author; // I'm sure there's a multi-author construct too
    license: LicenseIdentifier
  }

  type ResolveMasks = (
    includeVar: string | string[],
    excludeVar: string | string[],
    modifierFunction?: StringMap) => string[];

  type VersionIncrementStrategy =
    "major" | "minor" | "patch" | "prerelease";

  type StringEnvVar =
    "BUILD_CONFIGURATION" |
    "BUILD_PLATFORM" |
    "BUILD_ARCHITECTURE" |
    "BUILD_INCLUDE" |
    "BUILD_EXCLUDE" |
    "BUILD_ADDITIONAL_EXCLUDE" |
    "NUNIT_ARCHITECTURE" |
    "BUILD_REPORT_XML" |
    "NUNIT_LABELS" |
    "NUNIT_PROCESS" |
    "TEST_EXCLUDE" |
    "TEST_VERBOSITY" |
    "BUILD_TOOLSVERSION" |
    "BUILD_TARGETS" |
    "BUILD_VERBOSITY" |
    "COVERAGE_EXCLUDE" |
    "COVERAGE_INCLUDE" |
    "COVERAGE_ADDITIONAL_EXCLUDE" |
    "COVERAGE_XML" |
    "COVERAGE_REPORTING_EXCLUDE" |
    "GIT_OVERRIDE_BRANCH" |
    "GIT_BRANCH" |
    "GIT_MAIN_BRANCH" |
    "GIT_DEFAULT_UPSTREAM" |
    "GIT_VERIFY_BRANCH" |
    "GIT_OVERRIDE_REMOTE" |
    "GIT_REMOTE" |
    "NUGET_API_KEY" |
    "DOTNET_PUBLISH_RUNTIMES" |
    "DOTNET_PUBLISH_BUILD_CONFIGURATION" |
    "DOTNET_PUBLISH_OS" |
    "DOTNET_PUBLISH_ARCH" |
    "DOTNET_PUBLISH_FRAMEWORK" |
    "DOTNET_PUBLISH_MANIFEST" |
    "DOTNET_PUBLISH_VERSION_SUFFIX" |
    "DOTNET_PUBLISH_VERBOSITY" |
    "OUTPUT" |
    "PURGE_JS_DIRS" |
    "PURGE_DOTNET_DIRS" |
    "PURGE_ADDITIONAL_DIRS" |
    "PACK_TARGET_FOLDER" |
    "PACK_INCLUDE_CSPROJ" |
    "PACK_EXCLUDE_CSPROJ" |
    "PACK_INCLUDE_NUSPEC" |
    "PACK_EXCLUDE_NUSPEC" |
    "PACK_CONFIGURATION" |
    "PACK_SUPPLEMENTARY_NUSPEC" |
    "PACK_BASE_PATH" |
    "PACK_VERSION" |
    "PACK_VERBOSITY" |
    "PACKAGE_JSON" |
    "INCLUDE_PACKAGE_JSON" |
    "EXCLUDE_PACKAGE_JSON" |
    "NPM_PUBLISH_ACCESS" |
    "DOTNET_TEST_PREFIXES" |
    "VERSION_INCREMENT_STRATEGY" |
    "BUILD_TOOLS_FOLDER" |
    "MSBUILD_PROPERTIES" |
    "DEV_SMTP_BIND_IP" |
    "DEV_SMTP_INTERFACE_BIND_IP";

  type NumericEnvVar =
    "BUILD_MAX_CPU_COUNT" |
    "MAX_NUNIT_AGENTS" |
    "GIT_FETCH_TIMEOUT" |
    "GIT_VERIFY_TIMEOUT" |
    "GIT_FETCH_RECENT_TIME" |
    "NUGET_PUSH_TIMEOUT" |
    "PACK_INCREMENT_VERSION_BY" |
    "MAX_RETRIES" |
    "BUILD_RETRIES" |
    "RESTORE_RETRIES" |
    "MAX_CONCURRENCY" |
    "DEV_SMTP_PORT" |
    "DEV_SMTP_INTERFACE_PORT";

  type FlagEnvVar =
    "ENABLE_NUGET_PARALLEL_PROCESSING" |
    "BUILD_SHOW_INFO" |
    "BUILD_FAIL_ON_ERROR" |
    "BUILD_MSBUILD_NODE_REUSE" |
    "DOTNET_TEST_PARALLEL" |
    "DOTNET_CORE" |
    "DRY_RUN" |
    "ENFORCE_VERIFICATION" |
    "INTERACTIVE" |
    "SKIP_FETCH_ON_VERIFY" |
    "NO_UNICODE" |
    "NO_COLOR" |
    "NUGET_IGNORE_DUPLICATE_PACKAGES" |
    "PACK_INCREMENT_VERSION" |
    "PACK_INCLUDE_EMPTY_DIRECTORIES" |
    "PACK_INCLUDE_SYMBOLS" |
    "PACK_INCLUDE_SOURCE" |
    "PACK_IGNORE_MISSING_DEFAULT_NUSPEC" |
    "INITIAL_RELEASE" |
    "VERSION_INCREMENT_ZERO" |
    "BETA" |
    "RETAIN_TEST_DIAGNOSTICS" |
    "DOTNET_TEST_QUIET_QUACKERS" |
    "UPDATE_SUBMODULES_TO_LATEST" |
    "USE_SYSTEM_NUGET" |
    "DOTNET_DISABLE_BUILD_SERVERS" |
    "DOTNET_PUBLISH_SELF_CONTAINED" |
    "DOTNET_PUBLISH_NO_BUILD" |
    "DOTNET_PUBLISH_NO_RESTORE" |
    "DOTNET_PUBLISH_USE_CURRENT_RUNTIME" |
    "PACK_NO_BUILD" |
    "PACK_NO_RESTORE" |
    "ZARRO_ENABLE_CONFIGURATION_FILES" |
    "DEV_SMTP_DETACHED" |
    "DEV_SMTP_IGNORE_ERRORS" |
    "DEV_SMTP_OPEN_INTERFACE";

  type AnyEnvVar = StringEnvVar | NumericEnvVar | FlagEnvVar | VersionIncrementStrategy;
  type OverrideWhen = (existing: Optional<string>, potential: Optional<string>) => boolean;

  interface EnvRegistration {
    name: string;
    help: string | string[];
    tasks?: string | string[];
    overriddenBy?: string | string[];
    when?: OverrideWhen;
    default?: string;
  }

  type GetToolsFolder = (overrideEnv?: Env) => string;

  interface Open {
    open(url: string): Promise<void>;
  }

  interface Env {
    resolve(...names: (StringEnvVar | VersionIncrementStrategy)[]): string;
    resolveArray(name: AnyEnvVar): string[];
    resolveArray(name: AnyEnvVar, delimiter: string): string[];
    resolveNumber(name: NumericEnvVar): number;
    resolveFlag(name: FlagEnvVar): boolean;
    associate(varName: AnyEnvVar | AnyEnvVar[], tasks: string | string[]): void;
    resolveWithFallback<T>(varName: AnyEnvVar, fallback: T): T;
    resolveMap<T>(varName: AnyEnvVar, fallback?: T, delimiter?: string): T;
    register(reg: EnvRegistration): void;

    // these are generated on the js output by register-environment-variables
    // -> included here to avoid typos: use env.CONSTANT_NAME when you want
    // the constant name somewhere, eg in association
    BUILD_CONFIGURATION: StringEnvVar;
    BUILD_PLATFORM: StringEnvVar;
    BUILD_ARCHITECTURE: StringEnvVar;
    BUILD_INCLUDE: StringEnvVar;
    BUILD_EXCLUDE: StringEnvVar;
    BUILD_ADDITIONAL_EXCLUDE: StringEnvVar;
    NUNIT_ARCHITECTURE: StringEnvVar;
    BUILD_REPORT_XML: StringEnvVar;
    NUNIT_LABELS: StringEnvVar; // for now, at least
    NUNIT_PROCESS: StringEnvVar;
    TEST_INCLUDE: StringEnvVar;
    TEST_EXCLUDE: StringEnvVar;
    TEST_VERBOSITY: StringEnvVar; // for now, at least
    BUILD_TOOLSVERSION: StringEnvVar;
    BUILD_TARGETS: StringEnvVar;
    BUILD_VERBOSITY: StringEnvVar;
    COVERAGE_INCLUDE: StringEnvVar;
    COVERAGE_EXCLUDE: StringEnvVar;
    COVERAGE_ADDITIONAL_EXCLUDE: StringEnvVar;
    COVERAGE_XML: StringEnvVar;
    COVERAGE_REPORTING_EXCLUDE: StringEnvVar;
    GIT_OVERRIDE_BRANCH: StringEnvVar;
    GIT_BRANCH: StringEnvVar;
    GIT_MAIN_BRANCH: StringEnvVar;
    GIT_DEFAULT_UPSTREAM: StringEnvVar;
    GIT_VERIFY_BRANCH: StringEnvVar;
    GIT_OVERRIDE_REMOTE: StringEnvVar;
    GIT_REMOTE: StringEnvVar;
    NUGET_API_KEY: StringEnvVar;
    DOTNET_PUBLISH_RUNTIMES: StringEnvVar;
    DOTNET_PUBLISH_BUILD_CONFIGURATION: StringEnvVar;
    DOTNET_PUBLISH_OS: StringEnvVar;
    DOTNET_PUBLISH_ARCH: StringEnvVar;
    DOTNET_PUBLISH_FRAMEWORK: StringEnvVar;
    DOTNET_PUBLISH_MANIFEST: StringEnvVar;
    DOTNET_PUBLISH_VERSION_SUFFIX: StringEnvVar;
    DOTNET_PUBLISH_VERBOSITY: StringEnvVar;
    OUTPUT: StringEnvVar;
    PURGE_JS_DIRS: StringEnvVar;
    PURGE_DOTNET_DIRS: StringEnvVar;
    PURGE_ADDITIONAL_DIRS: StringEnvVar;
    PACK_TARGET_FOLDER: StringEnvVar;
    PACK_INCLUDE_CSPROJ: StringEnvVar;
    PACK_EXCLUDE_CSPROJ: StringEnvVar;
    PACK_INCLUDE_NUSPEC: StringEnvVar;
    PACK_EXCLUDE_NUSPEC: StringEnvVar;
    PACK_CONFIGURATION: StringEnvVar;
    PACK_SUPPLEMENTARY_NUSPEC: StringEnvVar;
    PACK_BASE_PATH: StringEnvVar;
    PACK_VERSION: StringEnvVar;
    PACK_VERBOSITY: DotNetVerbosity;
    PACKAGE_JSON: StringEnvVar;
    INCLUDE_PACKAGE_JSON: StringEnvVar;
    EXCLUDE_PACKAGE_JSON: StringEnvVar;
    NPM_PUBLISH_ACCESS: StringEnvVar;
    DOTNET_TEST_PREFIXES: StringEnvVar;
    VERSION_INCREMENT_STRATEGY: VersionIncrementStrategy;
    BUILD_TOOLS_FOLDER: StringEnvVar;
    MSBUILD_PROPERTIES: StringEnvVar;
    DEV_SMTP_BIND_IP: StringEnvVar;
    DEV_SMTP_INTERFACE_BIND_IP: StringEnvVar;

    ENABLE_NUGET_PARALLEL_PROCESSING: FlagEnvVar;
    BUILD_SHOW_INFO: FlagEnvVar;
    BUILD_FAIL_ON_ERROR: FlagEnvVar;
    BUILD_MSBUILD_NODE_REUSE: FlagEnvVar;
    DOTNET_TEST_PARALLEL: FlagEnvVar;
    DOTNET_CORE: FlagEnvVar;
    DRY_RUN: FlagEnvVar;
    ENFORCE_VERIFICATION: FlagEnvVar;
    INTERACTIVE: FlagEnvVar;
    SKIP_FETCH_ON_VERIFY: FlagEnvVar;
    NO_UNICODE: FlagEnvVar;
    NO_COLOR: FlagEnvVar;
    NUGET_IGNORE_DUPLICATE_PACKAGES: FlagEnvVar;
    PACK_INCREMENT_VERSION: FlagEnvVar;
    PACK_INCLUDE_EMPTY_DIRECTORIES: FlagEnvVar;
    PACK_INCLUDE_SYMBOLS: FlagEnvVar;
    INITIAL_RELEASE: FlagEnvVar;
    VERSION_INCREMENT_ZERO: FlagEnvVar;
    BETA: FlagEnvVar;
    RETAIN_TEST_DIAGNOSTICS: FlagEnvVar;
    DOTNET_TEST_QUIET_QUACKERS: FlagEnvVar;
    UPDATE_SUBMODULES_TO_LATEST: FlagEnvVar;
    USE_SYSTEM_NUGET: FlagEnvVar;
    DOTNET_DISABLE_BUILD_SERVERS: FlagEnvVar;
    DOTNET_PUBLISH_SELF_CONTAINED: FlagEnvVar;
    DOTNET_PUBLISH_NO_BUILD: FlagEnvVar;
    DOTNET_PUBLISH_NO_RESTORE: FlagEnvVar;
    DOTNET_PUBLISH_USE_CURRENT_RUNTIME: FlagEnvVar;
    PACK_NO_BUILD: FlagEnvVar;
    PACK_NO_RESTORE: FlagEnvVar;
    PACK_IGNORE_MISSING_DEFAULT_NUSPEC: FlagEnvVar;
    ZARRO_ENABLE_CONFIGURATION_FILES: FlagEnvVar;
    DEV_SMTP_DETACHED: FlagEnvVar;
    DEV_SMTP_IGNORE_ERRORS: FlagEnvVar;
    DEV_SMTP_OPEN_INTERFACE: FlagEnvVar;

    BUILD_MAX_CPU_COUNT: NumericEnvVar;
    MAX_NUNIT_AGENTS: NumericEnvVar;
    GIT_FETCH_TIMEOUT: NumericEnvVar;
    GIT_VERIFY_TIMEOUT: NumericEnvVar;
    GIT_FETCH_RECENT_TIME: NumericEnvVar;
    NUGET_PUSH_TIMEOUT: NumericEnvVar;
    PACK_INCREMENT_VERSION_BY: NumericEnvVar;
    MAX_RETRIES: NumericEnvVar;
    BUILD_RETRIES: NumericEnvVar;
    RESTORE_RETRIES: NumericEnvVar;
    MAX_CONCURRENCY: NumericEnvVar;
    DEV_SMTP_PORT: NumericEnvVar;
    DEV_SMTP_INTERFACE_PORT: NumericEnvVar;
  }

  type StatFunction = (path: string) => Promise<fs.Stats | null>

  interface GitSha {
    currentGitSHA(): string;
    currentShortSHA(): string;
    fetchGitSha(): Promise<string>;
  }

  // module defs: get these via requireModule<T>("module-name");
  type ReadTextFile = (path: string) => Promise<string>;
  type WriteTextFile = (path: string, data: string, options?: {
    encoding?: string | null,
    mode?: string | number,
    flag?: string | number
  } | string | null) => Promise<void>
  type ParseXml = (data: string) => Promise<Dictionary<any>>;
  type IncrementVersion = (
    version: string,
    strategy: string,
    zeroLowerOrder?: boolean,
    incrementBy?: number
  ) => Promise<string>;
  type ReadPackageVersion = (packageJsonPath?: string) => string | undefined;
  type ReadNuspecVersion = (pathToNuspec: string) => string | undefined;
  type ReadCsProjVersion = (pathToCsProj: string) => string | undefined;
  type ReadCsProjPackageVersion = (pathToCsProj: string) => string | undefined;
  type GatherPaths = (pathSpecs: string | string[], throwForNoMatches?: boolean) => Promise<string[]>;
  type PromisifyStream = (stream: Stream) => Promise<void>;
  type AlterPackageJson = (opts?: AlterPackageJsonVersionOptions) => Promise<void>;
  type Rimraf = (at: string, opts?: RimrafOptions) => Promise<void>;
  type ReadPackageJson = (at?: string) => Promise<PackageIndex>;
  type Exec =
    ((cmd: string, args?: string[], opts?: ExecOpts, handlers?: IoHandlers) => Promise<string>) & {
    alwaysSuppressOutput: boolean
  };
  type Uniq = (values: any[]) => any[];
  type EnvHelpers = {
    env: (name: string, fallback?: string) => string;
    envNumber: (name: string, fallback?: number) => number;
    envFlag: (name: string, fallback?: boolean) => boolean;
  };

  interface Version {
    major: number;
    minor: number;
    patch: number;
    tag: string;
    isPreRelease: boolean;
  }

  interface PackageInfo {
    id: string;
    version: Version;
  }

  interface PathUtils {
    splitPath: (path: string) => string[];
    baseName: (path: string) => string;
    chopExtension: (path: string) => string;
  }

  interface TestUtils {
    resolveTestPrefixFor: (path: string) => string;
  }

  type GulpIncrementNugetPackageDependencyVersion =
    (packageMatch: RegExp | string) => any;

  // @ts-ignore
  export interface ExecOpts extends ExecFileOptionsWithBufferEncoding {
    // force usage of execfile
    _useExecFile?: boolean;
    // exec normally mirrors output (and returns it)
    // -> set this to true to only return the output
    suppressOutput?: boolean;

    // merge stdout & stderr into one output
    mergeIo?: boolean;

    encoding?: string | null;
  }

  export interface NugetPushOpts {
    skipDuplicates?: boolean;
  }

  type PackOptions = {
    basePath?: string;
    excludeEmptyDirectories?: boolean;
    version?: string;
    symbols?: boolean;
    legacySymbols?: boolean;
  };
  type Pack = (opts?: PackOptions) => Stream;

  type Colors = "black"
    | "red"
    | "green"
    | "yellow"
    | "blue"
    | "magenta"
    | "cyan"
    | "white"
    | "gray"
    | "grey"
    // bright colors
    | "blackBright"
    | "redBright"
    | "greenBright"
    | "yellowBright"
    | "blueBright"
    | "magentaBright"
    | "cyanBright"
    | "whiteBright"

  type Status = {
    start(message: string, color?: Colors): void;
    ok(): void;
    fail(): void;
    run<T>(message: string, action: (() => T | Promise<T>)): void;
  };
  type Sleep = (ms: number) => Promise<void>;

  interface Failer {
    promise: Promise<void>;
    cancel(): void;
  }

  type FailAfter = (ms: number, message?: string) => Failer;

  type NugetUpdateSelf = (nugetPath: string) => Promise<void>;

  export interface FileSystemUtils {
    folderExists(at: string): Promise<boolean>;
    fileExists(at: string): Promise<boolean>;
    stat(p: string): Promise<StatsBase<any>>;
    readFile(p: string, opts: any): Promise<Buffer | string>;
    readdir(p: string): Promise<string[]>;
    mkdir(p: string, opts: any): Promise<void>;

    existsSync(p: string): boolean;
    writeFileSync(p: string, contents: Buffer): void;
  }

  // simple-git wrappers
  // resolves the (assumed primary) git remote at the current folder or provided override, allowing an environment override via GIT_REMOTE
  type ResolveGitRemote = (at?: string) => Promise<string | undefined>;
  // attempt to read the primary git remote, if there is one
  type ReadGitRemote = (at?: string) => Promise<string | undefined>;
  type ReadAllGitRemotes = (at?: string) => Promise<GitRemote[]>;
  // resolves the git branch at the current folder or provided override, allowing an environment override via GIT_BRANCH
  type ResolveGitBranch = (at?: string) => Promise<string | undefined>;
  // reads the checked out branch name at the current folder or provided override
  type ReadCurrentGitBranch = (at?: string) => Promise<string | undefined>;
  type ReadAllGitBranches = (at?: string) => Promise<string[]>;
  type ReadLastFetchTime = (at?: string) => Promise<Date | undefined>;
  // runs some git functionality, returning undefined if that functionality is run outside a repo folder
  type SafeGit = ((fn: () => Promise<any>, defaultValue?: any) => Promise<any | undefined>)

  type PromisifyFunction = (fn: Function, parent?: any, cannotError?: any) => ((...args: any[]) => Promise<any>);

  type ParseXmlString = (str: string) => any; // TODO: get xml types in here?
  type LoadXmlFile = (str: string) => any; // TODO: get xml types in here?

  type GitTagFromCsProj = (options?: GitTagOptions) => Stream;
  type GitFetch = (all: boolean) => Promise<void>;
  type NugetPush = (packageFile: string, sourceName?: string, options?: NugetPushOpts) => Promise<void>;

  interface Log {
    setThreshold(level: number): void;
    debug(...args: any[]): void;
    log(...args: any[]): void;
    info(...args: any[]): void;
    notice(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    fail(...args: any[]): void;
  }

  interface ParseNugetVersion {
    parseNugetVersion(versionStringOrFileName: string): Version;
  }

  type ReadGitCommitDeltaCount = (mainBranch: string, otherBranch: string) => Promise<GitCommitDeltaCount>;
  type ReadMainBranchName = () => Promise<string | undefined>;

  interface GitCommitDeltaCount {
    behind: number;
    ahead: number;
  }

  type AnsiColors = typeof ansiColors;

  type ReadGitInfo = (at?: string) => Promise<GitInfo>;

  enum GitRemoteUsage {
    fetch,
    push,
    fetchAndPush
  }

  interface GitRemote {
    name: string;
    url: string;
    usage: GitRemoteUsage
  }

  interface GitInfo {
    isGitRepository: boolean;
    remotes: GitRemote[];
    primaryRemote: string;
    branches: string[];
    currentBranch: string;
  }

  interface GitTagOptions {
    tag: string;
    comment?: string;
    where?: string;
    dryRun?: boolean;
    ignorePreRelease?: boolean;
    push?: boolean;
  }

  interface GitPushOptions {
    dryRun?: boolean;
    quiet?: boolean;
    where?: string
  }

  type GitTag = (tag: string | GitTagOptions, comment?: string, where?: string) => Promise<void>;
  type GitPush = (dryRun?: boolean | GitPushOptions, quiet?: boolean, where?: string) => Promise<void>;
  type GitPushTags = (dryRun?: boolean | GitPushOptions, comment?: string, where?: string) => Promise<void>;
  type QuoteIfRequired = (str?: string) => string;

  type StdioOptions = "pipe" | "ignore" | "inherit" |
    Array<("pipe" | "ipc" | "ignore" | "inherit" | any | number | null | undefined)>;

  type StringConsumer = (data: string) => void;
  type ProcessIO = string | StringConsumer;

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

    stdout?: ProcessIO;
    stderr?: ProcessIO;
    lineBuffer?: boolean;

    detached?: boolean;

    /*
    * when a process is marked as interactive, no stderr/stdout
    * collection is done as the IO is left as "inherit"
     */
    interactive?: boolean;
    suppressStdIoInErrors?: boolean
  }

  interface SpawnError extends Error {
    exe: string;
    args: string[];
    exitCode: number;
    stderr: string[];
    stdout: string[];
  }

  interface SpawnResult {
    executable: string;
    args: string[];
    exitCode: number;
    stderr: string[];
    stdout: string[];
  }

  type RequireModule = <T>(name: string) => T;

  type SpawnFunction = (program: string, args: string[], options?: SpawnOptions)
    => Promise<SpawnResult>;

  interface Spawn extends SpawnFunction {
    SpawnResult: Function;
    SpawnError: Function;
    isSpawnError: (o: any) => o is SpawnError;
    isSpawnResult: (o: any) => o is SpawnResult;
  }

  type AskOptions = {}
  type AskFunction = (message: string, options?: AskOptions) => Promise<string>;
  type Ask = {
    ask: AskFunction
  };

  interface GulpUtil {
    PluginError: PluginError;
    log: Logger;
    colors: StyleFunction;
  }

  interface PluginError extends Error {
    new(pluginName: string, err: string | Error): void;
    verbosity?: string;
  }

  type DotNetVerbosity = "q" | "quiet" | "m" | "minimal" | "n" | "normal" | "d" | "detailed" | "diag" | "diagnostic";

  type DotNetTestLoggers = Dictionary<Dictionary<string>>;

  interface DotNetBaseOptions extends IoConsumers {
    msbuildProperties?: Dictionary<string>;
    additionalArguments?: string[];
    verbosity?: DotNetVerbosity;
    // when set, errors are returned instead of thrown
    suppressErrors?: boolean;
    suppressStdIoInErrors?: boolean;
  }


  interface DotNetCommonBuildOptions extends DotNetBaseOptions {
    target: string;
    configuration?: string | string[];
    framework?: string;
    runtime?: string;
    output?: string;
    arch?: string;
    os?: string;
    disableBuildServers?: boolean;
  }

  interface DotNetPublishContainerOptions {
    publishContainer?: boolean;
  }

  interface DotNetPublishOptions
    extends DotNetCommonBuildOptions,
      DotNetPublishContainerOptions {
    useCurrentRuntime?: boolean;
    manifest?: string;
    noBuild?: boolean;
    noRestore?: boolean;
    selfContained?: boolean;
    versionSuffix?: string;
  }

  interface DotNetPackOptions extends DotNetBaseOptions {
    target: string;
    output?: string;
    configuration?: string | string[];
    noBuild?: boolean;
    includeSymbols?: boolean;
    includeSource?: boolean;
    noRestore?: boolean;
    versionSuffix?: string;
    nuspec?: string;
    ignoreMissingNuspec?: boolean
  }

  interface DotNetBuildOptions extends DotNetCommonBuildOptions {
    noIncremental?: boolean;
    disableBuildServers?: boolean;
    selfContained?: boolean;
    noDependencies?: boolean;
    noRestore?: boolean;
    versionSuffix?: string;
  }

  interface DotNetCleanOptions extends DotNetBaseOptions {
    target: string;
    framework?: string;
    runtime?: string;
    configuration?: string | string[],
    output?: string;
  }

  interface DotNetNugetPushOptions extends DotNetBaseOptions {
    target: string;
    apiKey: string;
    symbolApiKey?: string;
    disableBuffering?: boolean;
    noSymbols?: boolean;
    skipDuplicate?: boolean;
    noServiceEndpoint?: boolean;
    forceEnglishOutput?: boolean;
    source?: string;
    symbolSource?: string;
    timeout?: number;
  }

  interface IoConsumers {
    stdout?: IoConsumer;
    stderr?: IoConsumer;
  }

  interface DotNetTestOptions extends DotNetCommonBuildOptions {
    noBuild?: boolean;
    noRestore?: boolean;
    loggers?: DotNetTestLoggers;
    settingsFile?: string;
    env?: Dictionary<string>;
    filter?: string;
    diagnostics?: string;
  }

  interface DotNetPackageReference {
    id: string;
    version: string;
  }

  type DotNetTestFunction = (opts: DotNetTestOptions) => Promise<SpawnResult | SpawnError>;
  type DotNetBuildFunction = (opts: DotNetBuildOptions) => Promise<SpawnResult | SpawnError>;
  type DotNetPackFunction = (opts: DotNetPackOptions) => Promise<SpawnResult | SpawnError>;
  type DotNetNugetPushFunction = (opts: DotNetNugetPushOptions) => Promise<SpawnResult | SpawnError>;
  type DotNetCleanFunction = (opts: DotNetCleanOptions) => Promise<SpawnResult | SpawnError>;
  type DotNetPublishFunction = (opts: DotNetPublishOptions) => Promise<SpawnResult | SpawnError>;
  type DotNetListPackagesFunction = (projectPath: string) => Promise<DotNetPackageReference[]>;

  interface DotNetCli {
    clean: DotNetCleanFunction;
    build: DotNetBuildFunction;
    test: DotNetTestFunction;
    pack: DotNetPackFunction;
    nugetPush: DotNetNugetPushFunction;
    publish: DotNetPublishFunction;
    listPackages: DotNetListPackagesFunction;
  }

  type TransformFunction<T> = (opts: T) => Transform;
  type GulpDotNetTestFunction = TransformFunction<DotNetTestOptions>;
  type GulpDotNetBuildFunction = TransformFunction<DotNetBuildOptions>;
  type GulpDotNetPackFunction = TransformFunction<DotNetPackOptions>;
  type GulpDotNetNugetPushFunction = TransformFunction<DotNetNugetPushOptions>;
  type GulpDotNetCleanFunction = TransformFunction<DotNetCleanOptions>;
  type GulpDotNetPublishFunction = TransformFunction<DotNetPublishOptions>;

  interface GulpDotNetCli {
    build: GulpDotNetBuildFunction;
    clean: GulpDotNetCleanFunction;
    test: GulpDotNetTestFunction;
    pack: GulpDotNetPackFunction;
    nugetPush: GulpDotNetNugetPushFunction;
    publish: GulpDotNetPublishFunction;
  }

  // scraped from https://spdx.org/licenses/
  // with the following fragment from FF dev console
  // copy(Array.from(document.querySelector("table").querySelectorAll("tr")).map(tr => {
  //   return Array.from(tr.querySelectorAll("td"))[1]
  // }).filter(td => !!td).map(td => td.innerText))
  type LicenseIdentifier =
    "0BSD" |
    "AAL" |
    "Abstyles" |
    "Adobe-2006" |
    "Adobe-Glyph" |
    "ADSL" |
    "AFL-1.1" |
    "AFL-1.2" |
    "AFL-2.0" |
    "AFL-2.1" |
    "AFL-3.0" |
    "Afmparse" |
    "AGPL-1.0-only" |
    "AGPL-1.0-or-later" |
    "AGPL-3.0-only" |
    "AGPL-3.0-or-later" |
    "Aladdin" |
    "AMDPLPA" |
    "AML" |
    "AMPAS" |
    "ANTLR-PD" |
    "Apache-1.0" |
    "Apache-1.1" |
    "Apache-2.0" |
    "APAFML" |
    "APL-1.0" |
    "APSL-1.0" |
    "APSL-1.1" |
    "APSL-1.2" |
    "APSL-2.0" |
    "Artistic-1.0" |
    "Artistic-1.0-cl8" |
    "Artistic-1.0-Perl" |
    "Artistic-2.0" |
    "Bahyph" |
    "Barr" |
    "Beerware" |
    "BitTorrent-1.0" |
    "BitTorrent-1.1" |
    "blessing" |
    "BlueOak-1.0.0" |
    "Borceux" |
    "BSD-1-Clause" |
    "BSD-2-Clause" |
    "BSD-2-Clause-FreeBSD" |
    "BSD-2-Clause-NetBSD" |
    "BSD-2-Clause-Patent" |
    "BSD-3-Clause" |
    "BSD-3-Clause-Attribution" |
    "BSD-3-Clause-Clear" |
    "BSD-3-Clause-LBNL" |
    "BSD-3-Clause-No-Nuclear-License" |
    "BSD-3-Clause-No-Nuclear-License-2014" |
    "BSD-3-Clause-No-Nuclear-Warranty" |
    "BSD-3-Clause-Open-MPI" |
    "BSD-4-Clause" |
    "BSD-4-Clause-UC" |
    "BSD-Protection" |
    "BSD-Source-Code" |
    "BSL-1.0" |
    "bzip2-1.0.5" |
    "bzip2-1.0.6" |
    "Caldera" |
    "CATOSL-1.1" |
    "CC-BY-1.0" |
    "CC-BY-2.0" |
    "CC-BY-2.5" |
    "CC-BY-3.0" |
    "CC-BY-4.0" |
    "CC-BY-NC-1.0" |
    "CC-BY-NC-2.0" |
    "CC-BY-NC-2.5" |
    "CC-BY-NC-3.0" |
    "CC-BY-NC-4.0" |
    "CC-BY-NC-ND-1.0" |
    "CC-BY-NC-ND-2.0" |
    "CC-BY-NC-ND-2.5" |
    "CC-BY-NC-ND-3.0" |
    "CC-BY-NC-ND-4.0" |
    "CC-BY-NC-SA-1.0" |
    "CC-BY-NC-SA-2.0" |
    "CC-BY-NC-SA-2.5" |
    "CC-BY-NC-SA-3.0" |
    "CC-BY-NC-SA-4.0" |
    "CC-BY-ND-1.0" |
    "CC-BY-ND-2.0" |
    "CC-BY-ND-2.5" |
    "CC-BY-ND-3.0" |
    "CC-BY-ND-4.0" |
    "CC-BY-SA-1.0" |
    "CC-BY-SA-2.0" |
    "CC-BY-SA-2.5" |
    "CC-BY-SA-3.0" |
    "CC-BY-SA-4.0" |
    "CC-PDDC" |
    "CC0-1.0" |
    "CDDL-1.0" |
    "CDDL-1.1" |
    "CDLA-Permissive-1.0" |
    "CDLA-Sharing-1.0" |
    "CECILL-1.0" |
    "CECILL-1.1" |
    "CECILL-2.0" |
    "CECILL-2.1" |
    "CECILL-B" |
    "CECILL-C" |
    "CERN-OHL-1.1" |
    "CERN-OHL-1.2" |
    "ClArtistic" |
    "CNRI-Jython" |
    "CNRI-Python" |
    "CNRI-Python-GPL-Compatible" |
    "Condor-1.1" |
    "copyleft-next-0.3.0" |
    "copyleft-next-0.3.1" |
    "CPAL-1.0" |
    "CPL-1.0" |
    "CPOL-1.02" |
    "Crossword" |
    "CrystalStacker" |
    "CUA-OPL-1.0" |
    "Cube" |
    "curl" |
    "D-FSL-1.0" |
    "diffmark" |
    "DOC" |
    "Dotseqn" |
    "DSDP" |
    "dvipdfm" |
    "ECL-1.0" |
    "ECL-2.0" |
    "EFL-1.0" |
    "EFL-2.0" |
    "eGenix" |
    "Entessa" |
    "EPL-1.0" |
    "EPL-2.0" |
    "ErlPL-1.1" |
    "etalab-2.0" |
    "EUDatagrid" |
    "EUPL-1.0" |
    "EUPL-1.1" |
    "EUPL-1.2" |
    "Eurosym" |
    "Fair" |
    "Frameworx-1.0" |
    "FreeImage" |
    "FSFAP" |
    "FSFUL" |
    "FSFULLR" |
    "FTL" |
    "GFDL-1.1-only" |
    "GFDL-1.1-or-later" |
    "GFDL-1.2-only" |
    "GFDL-1.2-or-later" |
    "GFDL-1.3-only" |
    "GFDL-1.3-or-later" |
    "Giftware" |
    "GL2PS" |
    "Glide" |
    "Glulxe" |
    "gnuplot" |
    "GPL-1.0-only" |
    "GPL-1.0-or-later" |
    "GPL-2.0-only" |
    "GPL-2.0-or-later" |
    "GPL-3.0-only" |
    "GPL-3.0-or-later" |
    "gSOAP-1.3b" |
    "HaskellReport" |
    "HPND" |
    "HPND-sell-variant" |
    "IBM-pibs" |
    "ICU" |
    "IJG" |
    "ImageMagick" |
    "iMatix" |
    "Imlib2" |
    "Info-ZIP" |
    "Intel" |
    "Intel-ACPI" |
    "Interbase-1.0" |
    "IPA" |
    "IPL-1.0" |
    "ISC" |
    "JasPer-2.0" |
    "JPNIC" |
    "JSON" |
    "LAL-1.2" |
    "LAL-1.3" |
    "Latex2e" |
    "Leptonica" |
    "LGPL-2.0-only" |
    "LGPL-2.0-or-later" |
    "LGPL-2.1-only" |
    "LGPL-2.1-or-later" |
    "LGPL-3.0-only" |
    "LGPL-3.0-or-later" |
    "LGPLLR" |
    "Libpng" |
    "libpng-2.0" |
    "libselinux-1.0" |
    "libtiff" |
    "LiLiQ-P-1.1" |
    "LiLiQ-R-1.1" |
    "LiLiQ-Rplus-1.1" |
    "Linux-OpenIB" |
    "LPL-1.0" |
    "LPL-1.02" |
    "LPPL-1.0" |
    "LPPL-1.1" |
    "LPPL-1.2" |
    "LPPL-1.3a" |
    "LPPL-1.3c" |
    "MakeIndex" |
    "MirOS" |
    "MIT" |
    "MIT-0" |
    "MIT-advertising" |
    "MIT-CMU" |
    "MIT-enna" |
    "MIT-feh" |
    "MITNFA" |
    "Motosoto" |
    "mpich2" |
    "MPL-1.0" |
    "MPL-1.1" |
    "MPL-2.0" |
    "MPL-2.0-no-copyleft-exception" |
    "MS-PL" |
    "MS-RL" |
    "MTLL" |
    "MulanPSL-1.0" |
    "Multics" |
    "Mup" |
    "NASA-1.3" |
    "Naumen" |
    "NBPL-1.0" |
    "NCSA" |
    "Net-SNMP" |
    "NetCDF" |
    "Newsletr" |
    "NGPL" |
    "NLOD-1.0" |
    "NLPL" |
    "Nokia" |
    "NOSL" |
    "Noweb" |
    "NPL-1.0" |
    "NPL-1.1" |
    "NPOSL-3.0" |
    "NRL" |
    "NTP" |
    "NTP-0" |
    "OCCT-PL" |
    "OCLC-2.0" |
    "ODbL-1.0" |
    "ODC-By-1.0" |
    "OFL-1.0" |
    "OFL-1.0-no-RFN" |
    "OFL-1.0-RFN" |
    "OFL-1.1" |
    "OFL-1.1-no-RFN" |
    "OFL-1.1-RFN" |
    "OGL-Canada-2.0" |
    "OGL-UK-1.0" |
    "OGL-UK-2.0" |
    "OGL-UK-3.0" |
    "OGTSL" |
    "OLDAP-1.1" |
    "OLDAP-1.2" |
    "OLDAP-1.3" |
    "OLDAP-1.4" |
    "OLDAP-2.0" |
    "OLDAP-2.0.1" |
    "OLDAP-2.1" |
    "OLDAP-2.2" |
    "OLDAP-2.2.1" |
    "OLDAP-2.2.2" |
    "OLDAP-2.3" |
    "OLDAP-2.4" |
    "OLDAP-2.5" |
    "OLDAP-2.6" |
    "OLDAP-2.7" |
    "OLDAP-2.8" |
    "OML" |
    "OpenSSL" |
    "OPL-1.0" |
    "OSET-PL-2.1" |
    "OSL-1.0" |
    "OSL-1.1" |
    "OSL-2.0" |
    "OSL-2.1" |
    "OSL-3.0" |
    "Parity-6.0.0" |
    "PDDL-1.0" |
    "PHP-3.0" |
    "PHP-3.01" |
    "Plexus" |
    "PostgreSQL" |
    "PSF-2.0" |
    "psfrag" |
    "psutils" |
    "Python-2.0" |
    "Qhull" |
    "QPL-1.0" |
    "Rdisc" |
    "RHeCos-1.1" |
    "RPL-1.1" |
    "RPL-1.5" |
    "RPSL-1.0" |
    "RSA-MD" |
    "RSCPL" |
    "Ruby" |
    "SAX-PD" |
    "Saxpath" |
    "SCEA" |
    "Sendmail" |
    "Sendmail-8.23" |
    "SGI-B-1.0" |
    "SGI-B-1.1" |
    "SGI-B-2.0" |
    "SHL-0.5" |
    "SHL-0.51" |
    "SimPL-2.0" |
    "SISSL" |
    "SISSL-1.2" |
    "Sleepycat" |
    "SMLNJ" |
    "SMPPL" |
    "SNIA" |
    "Spencer-86" |
    "Spencer-94" |
    "Spencer-99" |
    "SPL-1.0" |
    "SSH-OpenSSH" |
    "SSH-short" |
    "SSPL-1.0" |
    "SugarCRM-1.1.3" |
    "SWL" |
    "TAPR-OHL-1.0" |
    "TCL" |
    "TCP-wrappers" |
    "TMate" |
    "TORQUE-1.1" |
    "TOSL" |
    "TU-Berlin-1.0" |
    "TU-Berlin-2.0" |
    "UCL-1.0" |
    "Unicode-DFS-2015" |
    "Unicode-DFS-2016" |
    "Unicode-TOU" |
    "Unlicense" |
    "UPL-1.0" |
    "Vim" |
    "VOSTROM" |
    "VSL-1.0" |
    "W3C" |
    "W3C-19980720" |
    "W3C-20150513" |
    "Watcom-1.0" |
    "Wsuipa" |
    "WTFPL" |
    "X11" |
    "Xerox" |
    "XFree86-1.1" |
    "xinetd" |
    "Xnet" |
    "xpp" |
    "XSkat" |
    "YPL-1.0" |
    "YPL-1.1" |
    "Zed" |
    "Zend-2.0" |
    "Zimbra-1.3" |
    "Zimbra-1.4" |
    "Zlib" |
    "zlib-acknowledgement" |
    "ZPL-1.1" |
    "ZPL-2.0" |
    "ZPL-2.1"
}
