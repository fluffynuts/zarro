// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import * as fs from "fs";
import { StatsBase } from "fs";
import { Stream, Transform } from "stream";
import ansiColors, { StyleFunction } from "ansi-colors";
import { RimrafOptions } from "./gulp-tasks/modules/rimraf";
import { ExecFileOptionsWithBufferEncoding } from "child_process";
import * as vinyl from "vinyl";
import { BufferFile } from "vinyl";
// noinspection ES6PreferShortImport
import { FetchReleaseOptions, ListReleasesOptions, ReleaseInfo } from "./gulp-tasks/modules/fetch-github-release/src";
import { DecompressOptions, File } from "decompress";

export * from "./gulp-tasks/modules/fetch-github-release/src";

type RequireModuleFunction<T> = (module: string) => T

interface RequireModule<T>
  extends RequireModuleFunction<T> {
  debug(): DebugFactory;
}

declare global {
  function requireModule<T>(module: string): T;

// copied out of @types/fancy-log because imports are being stupid
  interface Logger {
    (...args: any[]): Logger;

    dir(...args: any[]): Logger;

    error(...args: any[]): Logger;

    info(...args: any[]): Logger;

    warn(...args: any[]): Logger;
  }

  interface LogLevels {
    Debug: number;
    Info: number;
    Notice: number;
    Warning: number;
    Error: number;
  }

  enum LogThreshold {
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

  interface Log {
    setThreshold(level: number): void;

    debug(...args: any[]): void;

    info(...args: any[]): void;

    notice(...args: any[]): void;

    warn(...args: any[]): void;

    /**
     * @deprecated this is a link back to .warn(...)
     */
    warning(...args: any[]): void;

    error(...args: any[]): void;

    /**
     *  @deprecated this is a link back to .error(...)
     */
    fail(...args: any[]): void;

    ok(): void;

    suppressTimestamps(): void;

    showTimestamps(): void;

    LogLevels: LogLevels;

    threshold: LogThreshold;

  }


  type Func<T> = () => T;
  type DebugLogFunction = (...args: any[]) => void;
  type DebugFactory = (label: string) => DebugLogFunction;
  type VoidVoid = () => void;
  type AsyncVoidVoid = () => Promise<void>;
  type AsyncVoidFunc<T> = () => Promise<T>;
  type AsyncTVoid<T> = (arg: T) => Promise<void>;
  type OptionsFactory<T> = (file: vinyl.BufferFile) => T | Promise<T>;
  type ErrorReporter = (e: Error) => Promise<void> | void;
  type GulpCallback =
    (() => Promise<any> | NodeJS.EventEmitter) |
    ((done: VoidVoid) => Promise<any> | NodeJS.EventEmitter | void)
  type TryDo<T> = (
    logic: AsyncVoidFunc<T>,
    retries: number | string,
    onTransientError?: ErrorReporter,
    onFinalFailure?: VoidVoid
  ) => Promise<T>;
  type Optional<T> = T | undefined;
  type Nullable<T> = T | null;
  type DownloadNuget = (targetFolder: string, quiet?: boolean) => Promise<string>;

  interface ResolveNugetConfig {
    localNuget: string;
    nugetDownloadUrl: string;
  }

  type FindNpmBase = () => string;
  type ResolveNugetConfigGenerator = () => ResolveNugetConfig;
  type ResolveNuget = (nugetPath?: string, errorOnMissing?: boolean) => string;
  type FindLocalNuget = (quiet?: boolean) => Promise<string>;

  type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

  interface Streamify {
    streamify<T>(
      fn: AsyncTVoid<T>,
      optionsFactory: OptionsFactory<T>,
      pluginName: string,
      operation: string
    ): Transform;
  }

  interface HttpClient {
    new(): HttpClient;

    suppressProgress: boolean;
    assumeDownloadedIfExistsAndSizeMatches: boolean;
    aborted: boolean;

    download(url: string, target: string): Promise<string>;

    exists(url: string): Promise<boolean>;
  }

  interface Decompress {
    decompress(data: string | Buffer, target: string | DecompressOptions): Promise<File[]>;
  }

  type LogFunction = (s: string) => void;

  interface HttpClientModule {
    create(
      infoLogFunction?: LogFunction,
      debugLogFunction?: LogFunction
    ): HttpClient;
  }

  interface SrcOptions {
    allowEmpty?: boolean;
    read?: boolean
  }

  interface GulpWithHelp {
    task(name: string, callback: GulpCallback): void;

    task(name: string, help: string, callback: GulpCallback): void;

    task(name: string, dependencies: string[], callback?: GulpCallback): void;

    task(name: string, help: string, dependencies: string[], callback?: GulpCallback): void;

    src(mask: string | string[], opts?: SrcOptions): NodeJS.ReadableStream;

    dest(target: string): NodeJS.WritableStream;

    series(...tasks: string[]): (fn: Function) => void;
  }

  type RunSequence = (...args: (string | Function)[]) => void;
  type RunTaskFn = (task: string) => Promise<void>;
  type RunTasksFn = (...tasks: string[]) => Promise<void>;

  interface RunTask {
    runTask: RunTaskFn;
    runSeries: RunTasksFn;
    runParallel: RunTasksFn;
  }

  interface TemporaryEnvironmentRunner {
    run<T>(fn: (() => T | Promise<T>)): Promise<T>;
  }

  interface EnvDictionary {
    [key: AnyEnvVar | string]: string;
  }

  type WithEnvironment = (
    env: EnvDictionary,
    /**
     * If you'd like to replace the entire environment instead of augmenting it,
     * set this to true
     */
    replaceExistingEnvironment?: boolean
  ) => TemporaryEnvironmentRunner;
  type TemporaryEnvironment = {
    withEnvironment: WithEnvironment;
  }

  type Gulp = GulpWithHelp;
  type RunInParallel = (
    maxConcurrency: number,
    ...actions: AsyncVoidVoid[]
  ) => Promise<void>;
  type Seed = (howMany: number) => any[];
  type LineBuffer = {
    new(writer: LogFunction): LineBuffer;
    append(data: string | Buffer): void;
    flush(): void;
  };

  interface TestResults {
    quackersEnabled: boolean;
    passed: number;
    skipped: number;
    failed: number;
    started: number;
    failureSummary: string[];
    slowSummary: string[];
    fullLog: string[];
  }

  type DotNetTester = (configuration: string, source: string[]) => Promise<TestResults>;

  interface TestDotNetLogic {
    runTests: () => Promise<void>;
    testWithNunitCli: DotNetTester;
    testAsDotNetCore: DotNetTester;
    shouldTestInParallel: (testProjectPaths: string[]) => Promise<boolean>;
    testOneDotNetCoreProject: (
      target: string,
      configuration: string,
      verbosity: string,
      testResults: TestResults,
      runningInParallel: boolean,
      forceBuild?: boolean,
      suppressOutput?: boolean
    ) => Promise<SystemResult | SystemError>;
  }

  type VerifyExe = (path: string) => Promise<void>;

  interface VersionInfo {
    major: number;
    minor?: number;
    patch?: number;
    tag?: string;
  }

  interface Version {
    major: number;
    minor: number;
    patch: number;
    tag: string;
    isPreRelease: boolean;
    version: number[];

    new(version: string | number[] | VersionInfo): Version;

    new(major: number, minor?: number, patch?: number, tag?: string): Version;

    isGreaterThan(other: Version | string | number[]): boolean;

    isLessThan(other: Version | string | number[]): boolean;

    equals(other: Version | string | number): boolean;

    compareWith(other: Version | string | number): number;
  }

  interface NUnitRunnerOptions {
    result: string;
    agents: number;
    labels: string;
    process: string;
  }

  interface GulpNUnitRunnerOptions {
    executable: Optional<string>;
    options: NUnitRunnerOptions;
  }

  type GulpNunitRunner = (options: GulpNUnitRunnerOptions) => Transform;

  interface GulpVersion {
    major: number;
    minor: number;
    patch: number;
  }

  type SetTaskName = (task: any, name: string) => any;

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
    includeVar: StringEnvVar | StringEnvVar[],
    excludeVar: StringEnvVar | StringEnvVar[],
    modifierFunction?: StringMap
  ) => string[];

  type ShimNuget = (pathToNuget: string) => string;
  type Retry<T> = (fn: (() => Promise<T>), attempt?: number, maxAttempts?: number, wait?: number) => Promise<T>;

  type VersionIncrementStrategy =
    "major" | "minor" | "patch" | "prerelease";

  type StringEnvVar =
    "BUILD_CONFIGURATION" |
    "BUILD_PLATFORM" |
    "BUILD_ARCHITECTURE" |
    "BUILD_INCLUDE" |
    "BUILD_EXCLUDE" |
    "BUILD_ADDITIONAL_EXCLUDE" |
    "BUILD_FRAMEWORK" |
    "BUILD_RUNTIME" |
    "NUNIT_ARCHITECTURE" |
    "BUILD_REPORT_XML" |
    "NUNIT_LABELS" |
    "NUNIT_PROCESS" |
    "TEST_INCLUDE" |
    "TEST_ADDITIONAL_INCLUDE" |
    "TEST_EXCLUDE" |
    "TEST_ADDITIONAL_EXCLUDE" |
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
    "NUGET_API_KEYS" |
    "NUGET_PUSH_SOURCE" |
    "NUGET_SOURCE" |
    "NUGET_SOURCES" |
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
    "DEV_SMTP_INTERFACE_BIND_IP" |
    "DOTNET_PUBLISH_INCLUDE" |
    "DOTNET_PUBLISH_EXCLUDE" |
    "DOTNET_PUBLISH_ADDITIONAL_EXCLUDE" |
    "DOTNET_PUBLISH_CONTAINER_REGISTRY" |
    "DOTNET_PUBLISH_CONTAINER_IMAGE_TAG" |
    "DOTNET_PUBLISH_CONTAINER_IMAGE_NAME" |
    "TAG" |
    "GIT_TAG" |
    "GIT_VERSION_INCREMENT_MESSAGE" |
    string; // allow client-side extension, encourage usage of env.associate & env.register

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
    "DEV_SMTP_INTERFACE_PORT" |
    "DOTNET_PARALLEL_STAGGER_MS" |
    string;

  type FlagEnvVar =
    "ENABLE_NUGET_PARALLEL_PROCESSING" |
    "BUILD_SHOW_INFO" |
    "BUILD_FAIL_ON_ERROR" |
    "BUILD_MSBUILD_NODE_REUSE" |
    "DOTNET_TEST_PARALLEL" |
    "DOTNET_TEST_REBUILD" |
    "DOTNET_CORE" |
    "DRY_RUN" |
    "ENFORCE_VERIFICATION" |
    "INTERACTIVE" |
    "SKIP_FETCH_ON_VERIFY" |
    "NO_UNICODE" |
    "NO_COLOR" |
    "NUGET_IGNORE_DUPLICATE_PACKAGES" |
    "PACK_INCREMENT_VERSION" |
    "PACK_SYNC_PROJECT_VERSION" |
    "PACK_INCLUDE_EMPTY_DIRECTORIES" |
    "PACK_INCLUDE_SYMBOLS" |
    "PACK_INCLUDE_SOURCE" |
    "PACK_LEGACY_SYMBOLS" |
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
    "DEV_SMTP_OPEN_INTERFACE" |
    "DOTNET_PUBLISH_CONTAINER" |
    "ZARRO_ALLOW_FILE_RESOLUTION" |
    "NPM_PUBLISH_SKIP_OTP" |
    "SKIP_NUGET_UPDATE" |
    "PACK_INCREMENT_MINOR_ON_FIRST_PRERELEASE" |
    "BUILD_TOOLS_INSTALL_FORCE_NUGET_EXE" |
    string;

  type AnyEnvVar = StringEnvVar | NumericEnvVar | FlagEnvVar | VersionIncrementStrategy;
  type OverrideWhen = (existing: Optional<string>, potential: Optional<string>) => boolean;

  interface EnvRegistration {
    name: string | (keyof Env);
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

  type ResolveNugetApiKey = (forSource?: string) => Promise<Optional<string>>;

  interface Env
    extends Dictionary<any> {
    resolve(...names: (StringEnvVar | VersionIncrementStrategy)[]): string;

    /**
     * @description resolve an object from json set as an environment variable - note that the type annotation is for convenience: types _are not_ checked
     */
    resolveObject<T>(...names: (StringEnvVar | VersionIncrementStrategy)[]): T;

    resolveRequired(...names: (StringEnvVar | VersionIncrementStrategy)[]): string;

    resolveArray(name: AnyEnvVar | AnyEnvVar[], delimiter?: string): string[];

    resolveMergedArray(name: AnyEnvVar | AnyEnvVar[], delimiter?: string): string[];

    resolveNumber(name: NumericEnvVar): number;

    resolveFlag(name: FlagEnvVar, fallback?: boolean): boolean;

    associate(varName: AnyEnvVar | AnyEnvVar[], tasks: string | string[]): void;

    resolveWithFallback<T>(varName: AnyEnvVar, fallback: T): T;

    resolveMap(varName: AnyEnvVar, fallback?: Dictionary<string>, delimiter?: string): Dictionary<string>;

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
    BUILD_FRAMEWORK: StringEnvVar;
    BUILD_RUNTIME: StringEnvVar;
    NUNIT_ARCHITECTURE: StringEnvVar;
    BUILD_REPORT_XML: StringEnvVar;
    NUNIT_LABELS: StringEnvVar; // for now, at least
    NUNIT_PROCESS: StringEnvVar;
    TEST_INCLUDE: StringEnvVar;
    TEST_ADDITIONAL_INCLUDE: StringEnvVar;
    TEST_EXCLUDE: StringEnvVar;
    TEST_ADDITIONAL_EXCLUDE: StringEnvVar;
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
    NUGET_API_KEYS: StringEnvVar;
    NUGET_PUSH_SOURCE: StringEnvVar;
    NUGET_SOURCES: StringEnvVar;
    NUGET_SOURCE: StringEnvVar;
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
    DOTNET_PUBLISH_INCLUDE: StringEnvVar;
    DOTNET_PUBLISH_EXCLUDE: StringEnvVar;
    DOTNET_PUBLISH_ADDITIONAL_EXCLUDE: StringEnvVar;
    DOTNET_PUBLISH_CONTAINER_REGISTRY: StringEnvVar;
    DOTNET_PUBLISH_CONTAINER_IMAGE_TAG: StringEnvVar;
    DOTNET_PUBLISH_CONTAINER_IMAGE_NAME: StringEnvVar;
    TAG: StringEnvVar;
    GIT_TAG: StringEnvVar;
    GIT_VERSION_INCREMENT_MESSAGE: StringEnvVar;

    ENABLE_NUGET_PARALLEL_PROCESSING: FlagEnvVar;
    BUILD_SHOW_INFO: FlagEnvVar;
    BUILD_FAIL_ON_ERROR: FlagEnvVar;
    BUILD_MSBUILD_NODE_REUSE: FlagEnvVar;
    DOTNET_TEST_PARALLEL: FlagEnvVar;
    DOTNET_TEST_REBUILD: FlagEnvVar;
    DOTNET_CORE: FlagEnvVar;
    DRY_RUN: FlagEnvVar;
    ENFORCE_VERIFICATION: FlagEnvVar;
    INTERACTIVE: FlagEnvVar;
    SKIP_FETCH_ON_VERIFY: FlagEnvVar;
    NO_UNICODE: FlagEnvVar;
    NO_COLOR: FlagEnvVar;
    NUGET_IGNORE_DUPLICATE_PACKAGES: FlagEnvVar;
    PACK_INCREMENT_VERSION: FlagEnvVar;
    PACK_SYNC_PROJECT_VERSION: FlagEnvVar;
    PACK_INCLUDE_EMPTY_DIRECTORIES: FlagEnvVar;
    PACK_INCLUDE_SYMBOLS: FlagEnvVar;
    PACK_INCLUDE_SOURCE: FlagEnvVar;
    PACK_LEGACY_SYMBOLS: FlagEnvVar;
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
    DOTNET_PUBLISH_CONTAINER: FlagEnvVar;
    ZARRO_ALLOW_FILE_RESOLUTION: FlagEnvVar;
    NPM_PUBLISH_SKIP_OTP: FlagEnvVar;
    SKIP_NUGET_UPDATE: FlagEnvVar;
    PACK_INCREMENT_MINOR_ON_FIRST_PRERELEASE: FlagEnvVar;
    BUILD_TOOLS_INSTALL_FORCE_NUGET_EXE: FlagEnvVar;

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
    DOTNET_PARALLEL_STAGGER_MS: NumericEnvVar;
  }

  type StatFunction = (path: string) => Promise<fs.Stats | null>

  interface GitSha {
    fetchGitSha(
      forRepo?: string,
      short?: boolean
    ): Promise<string>;

    init(): Promise<void>;

    currentShortSHA: () => string;
    currentGitSHA: () => string;
  }

  interface ZarroError
    extends Error {
    new(message: string): ZarroError;
  }

  interface ZarroErrorModule {

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
  ) => string;
  type ReadPackageVersion = (packageJsonPath?: string) => Promise<string | undefined>;
  type ReadNuspecVersion = (pathToNuspec: string) => Promise<string | undefined>;
  // FIXME: is this used anywhere? should be supplanted by csproj-utils
  type ReadCsProjVersion = (pathToCsProj: string) => Promise<string | undefined>;
  type ReadCsProjPackageVersion = (pathToCsProj: string) => string | undefined;
  type GatherPaths = (pathSpecs: string | string[], throwForNoMatches?: boolean) => Promise<string[]>;
  type PromisifyStream = (stream: Stream) => Promise<void>;

  interface AlterPackageJsonVersionOptions {
    packageJsonPath?: string;
    dryRun?: boolean;
    strategy?: string;
    zero?: boolean;
    loadUnsetFromEnvironment?: boolean;
    incrementBy?: number
  }

  type GuessIndent = (text: string) => number;

  type AlterPackageJson = (opts?: AlterPackageJsonVersionOptions) => Promise<void>;
  type Rimraf = (at: string, opts?: RimrafOptions) => Promise<void>;
  type ReadPackageJson = (at?: string) => Promise<PackageIndex>;

  type IoConsumer = (d: string) => void

  interface IoHandlers {
    stdout?: IoConsumer;
    stderr?: IoConsumer;
  }

  interface ExecError
    extends Error {
    info: {
      exitCode: number;
      cmd: string;
      args: string[];
      opts?: ExecOpts;
      stdout: string[];
      stderr: string[];
      timedOut: boolean;
    }
  }

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
  }

  interface PackageInfo {
    id: string;
    version: Version;
    source?: string;
  }

  interface PathUtils {
    splitPath: (path: string) => string[];
    baseName: (path: string) => string;
    chopExtension: (path: string) => string;
  }

  interface ObsoleteWarning {
    reason: string;
    expires: string;
  }

  type MakeObsolete = (module: any, data: ObsoleteWarning) => any;

  interface TestUtils {
    resolveTestPrefixFor: (path: string) => string;
  }

  type GulpIncrementNugetPackageDependencyVersion =
    (packageMatch: RegExp | string) => any;

  // @ts-ignore
  export interface ExecOpts
    extends ExecFileOptionsWithBufferEncoding {
    // force usage of execFile
    _useExecFile?: boolean;
    // exec normally mirrors output (and returns it)
    // -> set this to true to only return the output
    encoding?: string | null;

    // merge stdout & stderr into one output
    mergeIo?: boolean;

    suppressOutput?: boolean;
  }

  export interface NugetPushOpts {
    skipDuplicates?: boolean;
  }

  type IsWindows = () => boolean;

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
  type Which = (executable: string) => Optional<string>;

  interface Failer {
    promise: Promise<void>;

    cancel(): void;
  }

  type FailAfter = (ms: number, message?: string) => Failer;

  type NugetUpdateSelf = (nugetPath: string) => Promise<void>;

  interface TestUtilFinderOptions {
    x86?: boolean;
    platform?: string;
    architecture?: string;
    ignoreBetas?: boolean;
  }

  interface TestUtilFinder {
    latestNUnit(opts?: TestUtilFinderOptions): Optional<string>;

    latestDotCover(opts?: TestUtilFinderOptions): Optional<string>;

    latestOpenCover(): Optional<string>;

    findTool(exeName: string, underFolder?: string): Optional<string>;

    /**
     * @deprecated
     */
    nunit2Finder(): Optional<string>;

    /**
     * @description used to sort arrays of versioned folders
     */
    compareVersionArrays(x: number[], y: number[]): number;
  }

  /**
   * @deprecated rather require("yafs")
   */
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

  type UpdateNuspecVersion = (fileOrXml: string, newVersion: string) => Promise<string>;

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
    suppressStdIoInErrors?: boolean;

    /*
    * quotes can be hard, so if things aren't working out and
    * you'd like to take full control, set this
     */
    disableAutomaticQuoting?: boolean;

    /**
     * when set true, output will not be echoed back on the
     * console, but you will be able to get it from a custom
     * io writer or the result from after spawn completes
     */
    suppressOutput?: boolean;
  }

  interface SystemOptions {
    windowsHide?: boolean;
    timeout?: number;
    argv0?: string;
    shell?: boolean | string;
    windowsVerbatimArguments?: boolean;

    uid?: number;
    gid?: number;
    cwd?: string;
    env?: NodeJS.ProcessEnv;

    stdout?: ProcessIO;
    stderr?: ProcessIO;

    detached?: boolean;

    /*
    * when a process is marked as interactive, no stderr/stdout
    * collection is done as the IO is left as "inherit"
     */
    interactive?: boolean;
    suppressStdIoInErrors?: boolean;

    /**
     * when set true, output will not be echoed back on the
     * console, but you will be able to get it from a custom
     * io writer or the result from after spawn completes
     */
    suppressOutput?: boolean;

    /**
     * when set to true, if a temporary file for launching your command was
     * required, it won't be cleaned up. It will appear in the spawn output
     * / error as the first argument, with the exe set to either cmd or sh
     */
    keepTempFiles?: boolean;
  }

  /**
   * @deprecated rather use the better-tested `system` module and SystemError
   */
  interface SpawnError
    extends Error {
    new(
      message: string,
      exe: string,
      args: string[] | undefined,
      exitCode: number,
      stdout: Nullable<string[]>,
      stderr: Nullable<string[]>
    ): SpawnError;

    exe: string;
    args: string[];
    exitCode: number;
    stderr: string[];
    stdout: string[];

    isSpawnError(o: any): o is SpawnError
  }

  /**
   * @deprecated rather use the better-tested `system` module and SystemResult
   */
  interface SpawnResult {
    new(
      executable: string,
      args: string[],
      exitCode: number,
      stderr: string[],
      stdout: string[]
    ): SpawnResult;

    executable: string;
    args: string[];
    exitCode: number;
    stderr: string[];
    stdout: string[];

    isSpawnResult(o: any): o is SpawnResult
  }

  interface Linq {
    last<T>(arr: T[]): Optional<T>;

    first<T>(arr: T[]): Optional<T>;

    skip<T>(arr: T[] | IterableIterator<T>, howMany: number): IterableIterator<T>;

    take<T>(arr: T[] | IterableIterator<T>, howMany: number): IterableIterator<T>;
  }

  type RequireModuleFn = <T>(name: string) => T;

  type SpawnFunction = (program: string, args?: string[], options?: SpawnOptions)
    => Promise<SpawnResult>;

  interface Spawn
    extends SpawnFunction {
    SpawnResult: Function;
    SpawnError: Function;
    isSpawnError: (o: any) => o is SpawnError;
    isSpawnResult: (o: any) => o is SpawnResult;
  }

  interface SystemCommand {
    exe: string;
    args: string[];
  }

  interface SystemResultImpl
    extends SystemCommand {
    new(
      exe: string,
      args: string[],
      exitCode: Optional<number>,
      stderr: string[],
      stdout: string[]
    ): SystemResult;

    exitCode?: number;
    stderr: string[];
    stdout: string[];

    isResult(): this is SystemResult;
    isError(): this is SystemError;
  }

  interface SystemResultBuilder {
    withExe(exe: string): SystemResultBuilder;
    withArgs(args: string[]): SystemResultBuilder;
    withExitCode(code: number): SystemResultBuilder;
    withStdErr(lines: string[] | string): SystemResultBuilder;
    withStdOut(lines: string[] | string): SystemResultBuilder;
    build(): SystemResult;
  }

  type SystemResult = {
    create(): SystemResultBuilder;
  } & SystemResultImpl;

  interface SystemError
    extends Error, SystemCommand {
    new(
      message: string,
      exe: string,
      args: string[] | undefined,
      exitCode: number,
      stdout: Nullable<string[]>,
      stderr: Nullable<string[]>
    ): SystemError;

    exitCode: number;
    stderr: string[];
    stdout: string[];

    isError(o: any): o is SystemError;

    isResult(o: any): o is SystemError;
  }

  type SystemFunction = (program: string, args?: string[], options?: SystemOptions)
    => Promise<SystemResult | SystemError>;

  interface System
    extends SystemFunction {
    isError(o: any): o is SystemError;
    isResult(o: any): o is SystemResult;
  }

  interface TempFile {
    path: string;
    destroy(): void;
  }

  type ThrowIfNoFiles = (msg: string) => Transform;
  type LogConfig = (config: any, labels: Dictionary<string>) => void;

  interface NugetRestoreOptions {
    debug?: boolean;
    force?: boolean;
    nuget?: string;
  }

  type ZarroTestPackage = "local" | "beta" | "latest" | string;
  interface TestZarroOptions {
    packageVersion: ZarroTestPackage;
    tasks: string | string[];
    rollback?: boolean;
  }
  type TestZarro = (opts: TestZarroOptions) => Promise<void>;

  type GulpNugetRestore = (opts: NugetRestoreOptions) => Stream;
  type LongestStringLength = (strings: string[]) => number;
  /**
   * @description generates a version suffix based on the current timestamp and git SHA
   */
  type GenerateVersionSuffix = () => string;

  interface GulpPurgeOptions {
    dryRun?: boolean;
    debug?: boolean;
    stopOnErrors?: boolean;
  }

  type GulpPurge = (options: GulpPurgeOptions) => Transform;

  interface GulpNpmRun {
    gulpNpmRun: (gulp: Gulp) => void;
    isNpmScript: (name: string) => boolean;
  }
  type Nuget = (args: string[], opts?: SystemOptions) => Promise<void>;

  interface CliSupport {
    pushIfSet: (args: string[], value: Optional<string | number>, cliSwitch: string) => void;
    pushFlag: (args: string[], value: Optional<boolean>, cliSwitch: string) => void;
  }

  interface NugetInstallOptions {
    packageId: string;
    version?: string;
    outputDirectory?: string;
    dependencyVersion?: string;
    framework?: string;
    excludeVersion?: string;
    preRelease?: boolean;
    requireConsent?: boolean;
    solutionDirectory?: string;
    source?: string;
    fallbackSource?: string;
    noCache?: boolean;
    directDownload?: boolean;
    disableParallelProcessing?: boolean;
    packageSaveMode?: NugetPackageSaveMode;
    verbosity?: NugetVerbosity;
    nonInteractive?: boolean;
    configFile?: string;
    forceEnglishOutput?: boolean;

    systemOptions?: SystemOptions;
  }

  type NugetPackageSaveMode = "nuspec" | "nupkg" | "nuspec;nupkg";
  type NugetVerbosity = "normal" | "quiet" | "detailed";

  interface NugetCli {
    install: (opts: NugetInstallOptions) => Promise<void>;
    clearAllCache(): Promise<void>;
    clearHttpCache(): Promise<void>;
    listSources(): Promise<NugetSource[]>;
    addSource(src: NugetAddSourceOptions): Promise<void>;
    enableSource(name: string): Promise<void>;
    disableSource(name: string): Promise<void>;
  }

  type ParseNugetSources = (lines: string[]) => NugetSource[];

  type CreateTempFile = (contents?: string | Buffer, at?: string) => Promise<TempFile>;
  type MultiSplit = (str: string, delimiters: string[]) => string[];

  type GulpNetFXTestAssemblyFilter = (configuration: string) => ((f: BufferFile) => boolean);
  type Pad = (str: string, len: number, isRight?: boolean, padString?: string) => string;
  type PadLeft = (str: string, len: number, padString?: string) => string;
  type PadRight = (str: string, len: number, padString?: string) => string;
  type PathUnquote = (str: string) => string;
  type ResolveTestMasks = (isDotnetCore?: boolean) => string[];

  interface AskOptions {
    inputStream?: NodeJS.ReadStream,
    outputStream?: NodeJS.WriteStream,
    validator?: (s: string) => boolean;
  }
  type AskFunction = (message: string, options?: AskOptions) => Promise<string>;
  type Ask = {
    ask: AskFunction
  };

  interface GulpUtil {
    PluginError: PluginError;
    log: Logger;
    colors: StyleFunction;
  }

  interface PluginError
    extends Error {
    new(pluginName: string, err: string | Error): void;

    verbosity?: string;
  }

  type DotNetVerbosity = "q" | "quiet" | "m" | "minimal" | "n" | "normal" | "d" | "detailed" | "diag" | "diagnostic";

  type DotNetTestLoggers = Dictionary<Dictionary<string>>;

  interface DotNetBaseOptions
    extends IoConsumers {
    msbuildProperties?: Dictionary<string>;
    additionalArguments?: string[];
    verbosity?: DotNetVerbosity | string;
    // when set, errors are returned instead of thrown
    suppressErrors?: boolean;
    suppressStdIoInErrors?: boolean;
    suppressOutput?: boolean;

    env?: Dictionary<string>;
  }

  type GulpXBuild = (opts?: any) => Transform;
  type GulpMsBuild = (opts?: any) => Transform;

  interface GulpXBuildOptions {
    target: string | string[],
    noConsoleLogger?: boolean;
    configuration?: string;
    verbosity?: string;
    platform?: string;
    nologo?: boolean;
  }

  interface GulpDotNetCoverExec {
    dotCover?: string;
    openCover?: string;
    nunit?: string;
  }

  interface GulpDotNetCoverOptions {
    failOnError?: boolean;
    exec?: GulpDotNetCoverExec;
    baseFilters?: string;
    exclude?: string[];
    nunitOptions?: string;
    allowProjectAssemblyMismatch?: boolean;
    nunitOutput?: string;
    coverageReportBase?: string;
    coverageOutput?: string;
    agents?: number;
    testAssemblyFilter?: ((f: string) => boolean) | RegExp;
    coverageTool?: string;
    testAssemblies?: string[];
    debug?: boolean;

    x86?: boolean;
    platform?: string;
    architecture?: string;
  }

  type GulpDotNetCover = (opts?: GulpDotNetCoverOptions) => Transform;

  interface DotNetCommonBuildOptions
    extends DotNetBaseOptions {
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
    containerImageTag?: string;
    containerRegistry?: string;
    containerImageName?: string;
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

  interface DotNetPackOptions
    extends DotNetBaseOptions {
    target: string;
    output?: string;
    configuration?: string | string[];
    noBuild?: boolean;
    includeSymbols?: boolean;
    includeSource?: boolean;
    noRestore?: boolean;
    versionSuffix?: string;
    nuspec?: string;
    /**
     * @description when the specified Package.nuspec is not
     * found and this flag is set, then pack() will silently
     * drop the option; otherwise an error will be thrown.
     */
    ignoreMissingNuspec?: boolean
  }

  interface DotNetBuildOptions
    extends DotNetCommonBuildOptions {
    noIncremental?: boolean;
    disableBuildServers?: boolean;
    selfContained?: boolean;
    noDependencies?: boolean;
    noRestore?: boolean;
    versionSuffix?: string;
  }

  interface DotNetCleanOptions
    extends DotNetBaseOptions {
    target: string;
    framework?: string;
    runtime?: string;
    configuration?: string | string[],
    output?: string;
  }

  interface DotNetNugetPushOptions
    extends DotNetBaseOptions {
    target: string;
    apiKey?: string;
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

  interface DotNetSearchPackagesOptions extends DotNetBaseOptions {
    source?: string;
    search?: string;
    take?: number;
    skip?: number;
    exactMatch?: boolean;
    preRelease?: boolean;
    configFile?: string;
  }

  interface DotNetInstallNugetPackageOption extends DotNetBaseOptions {
    id: string;
    projectFile: string;
    version?: string;
    framework?: string;
    noRestore?: boolean;
    source?: string;
    packageDirectory?: string;
    preRelease?: boolean;
  }

  interface IoConsumers {
    stdout?: IoConsumer;
    stderr?: IoConsumer;
  }

  interface DotNetTestOptions
    extends DotNetCommonBuildOptions {
    noBuild?: boolean;
    noRestore?: boolean;
    loggers?: DotNetTestLoggers;
    settingsFile?: string;
    env?: Dictionary<string>;
    filter?: string;
    diagnostics?: string;
    label?: string;
  }

  interface NugetSource {
    name: string;
    url: string;
    enabled: boolean;
  }

  interface NugetAddSourceOptions {
    name: string;
    url: string;
    username?: string;
    password?: string;
    storePasswordInClearText?: boolean;
    validAuthenticationTypes?: string;
    configFile?: string;
    enabled?: boolean;
  }

  interface DotNetPackageReference {
    id: string;
    version: string;
  }

  interface ResolvedContainerOption {
    value: string;
    environmentVariable: string;
    option: keyof DotNetPublishContainerOptions;
    usingFallback: boolean;
  }

  type DotNetTestFunction = (opts: DotNetTestOptions) => Promise<SystemResult | SystemError>;
  type DotNetBuildFunction = (opts: DotNetBuildOptions) => Promise<SystemResult | SystemError>;
  type DotNetPackFunction = (opts: DotNetPackOptions) => Promise<SystemResult | SystemError>;
  type DotNetNugetPushFunction = (opts: DotNetNugetPushOptions) => Promise<SystemResult | SystemError>;
  type DotNetCleanFunction = (opts: DotNetCleanOptions) => Promise<SystemResult | SystemError>;
  type DotNetPublishFunction = (opts: DotNetPublishOptions) => Promise<SystemResult | SystemError>;
  type DotNetListPackagesFunction = (projectPath: string) => Promise<DotNetPackageReference[]>;
  type DotNetPublishResolveContainerOptions = (opts: DotNetPublishOptions) => Promise<ResolvedContainerOption[]>;
  type DotNetNugetAddSourceFunction = (opts: NugetAddSourceOptions) => Promise<void>;
  type DotNetRemoveNugetSourceFunction = (source: string | NugetSource) => Promise<void>;
  type DotNetListNugetSourcesFunction = () => Promise<NugetSource[]>;
  type DotNetEnableNugetSourceFunction = (source: string | NugetSource) => Promise<void>;
  type DotNetDisableNugetSourceFunction = (source: string | NugetSource) => Promise<void>;
  type DotNetTryMatchNugetSourceFunction = (nameOrUrlOrHostOrSpec: string | Partial<NugetSource> | RegExp) => Promise<Optional<NugetSource>>;
  type DotNetSearchNugetPackagesFunction = (opts: DotNetSearchPackagesOptions | string) => Promise<PackageInfo[]>;
  type DotNetInstallNugetPackageFunction = (opts: DotNetInstallNugetPackageOption | string) => Promise<void>;

  interface DotNetCli {
    clean: DotNetCleanFunction;
    build: DotNetBuildFunction;
    test: DotNetTestFunction;
    pack: DotNetPackFunction;
    nugetPush: DotNetNugetPushFunction;
    publish: DotNetPublishFunction;
    listPackages: DotNetListPackagesFunction;
    resolveContainerOptions: DotNetPublishResolveContainerOptions;
    listNugetSources: DotNetListNugetSourcesFunction;
    addNugetSource: DotNetNugetAddSourceFunction;
    removeNugetSource: DotNetRemoveNugetSourceFunction;
    enableNugetSource: DotNetEnableNugetSourceFunction;
    disableNugetSource: DotNetDisableNugetSourceFunction;
    tryFindConfiguredNugetSource: DotNetTryMatchNugetSourceFunction;
    incrementTempDbPortHintIfFound: (env: Dictionary<string>) => void;
    searchPackages: DotNetSearchNugetPackagesFunction;
    installPackage: DotNetInstallNugetPackageFunction;
  }

  type ReadCsProjNode = (csproj: string) => Promise<string>;
  type ReadCsProjProperty = (
    pathToCsProj: string,
    property: string,
    fallback?: string | (() => Promise<string>)
  ) => Promise<Optional<string>>;

  interface GulpIncrementNugetPackageVersion {
    incrementPackageVersion: TransformFunction<void>;
  }

  interface CsProjUtils {
    readPackageVersion: ReadCsProjNode;
    readAssemblyVersion: ReadCsProjNode;
    readAssemblyName: ReadCsProjNode;
    readProjectVersion: ReadCsProjNode;
    readCsProjProperty: ReadCsProjProperty;
  }

  type VoidTransformFunction = () => Transform;
  type TransformFunctionWithOptionalArgs<T> = (opts?: T) => Transform;
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

  interface FetchGithubRelease {
    fetchLatestRelease(options: Omit<FetchReleaseOptions, "getRelease">): Promise<string[]>

    fetchReleaseByTag(options: Omit<FetchReleaseOptions, "getRelease"> & { tag: string; }): Promise<string[]>;

    fetchLatestReleaseInfo(options: ListReleasesOptions): Promise<ReleaseInfo>;

    listReleases(options: ListReleasesOptions): Promise<ReleaseInfo[]>;
  }

  interface InstallLocalTools {
    install: (required: string | string[], overrideToolsFolder?: string) => Promise<void>;
    clean: (overrideToolsFolder?: string) => Promise<void>;
  }

  interface RewriteFile {
    rewriteFile: (transform?: ((s: Buffer) => Buffer)) => Transform;
  }

  interface GulpNugetPack {
    pack: TransformFunctionWithOptionalArgs<PackOptions>;
  }

  type SpawnNuget = (args: string[], opts?: SystemOptions) => Promise<SystemResult>;
  type IsPromise = (obj: any) => obj is Promise<any>;

  type GitTagAndPush = (tag?: string, dryRun?: boolean) => Promise<void>;

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
    "CATO-1.1" |
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

