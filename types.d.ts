import * as fs from "fs";
import { Stream } from "stream";
import { StyleFunction } from "ansi-colors";
import { AlterPackageJsonVersionOptions } from "./gulp-tasks/modules/alter-package-json-version";
import { RimrafOptions } from "./gulp-tasks/modules/rimraf";
import { ExecFileOptionsWithBufferEncoding } from "child_process";
import { IoHandlers } from "./gulp-tasks/modules/exec";
import { StatsBase } from "fs";

// copied out of @types/fancy-log because imports are being stupid
interface Logger {
  (...args: any[]): Logger;
  dir(...args: any[]): Logger;
  error(...args: any[]): Logger;
  info(...args: any[]): Logger;
  warn(...args: any[]): Logger;
}

declare global {
  function requireModule<T>(module: string): T;

  type VoidVoid = () => void;
  type GulpCallback =
    (() => Promise<any> | NodeJS.EventEmitter) | ((done: VoidVoid) => Promise<any> | NodeJS.EventEmitter)

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
    includeVar: string,
    excludeVar: string,
    modifierFunction?: StringMap) => string[];

  interface Env {
    resolve(...names: string[]): string;
    resolveArray(name: string): string[];
    resolveArray(name: string, delimiter: string): string[];
    resolveNumber(name: string): number;
    resolveFlag(name: string): boolean;
    associate(varName: string | string[], tasks: string | string[]): void;

    // these are generated on the js output by register-environment-variables
    // -> included here to avoid typos: use env.CONSTANT_NAME when you want
    // the constant name somewhere, eg in association
    BETA: string;
    USE_SYSTEM_NUGET: string;
    ENABLE_NUGET_PARALLEL_PROCESSING: string;
    BUILD_SHOW_INFO: string;
    BUILD_FAIL_ON_ERROR: string;
    BUILD_MSBUILD_NODE_REUSE: string;
    MAX_CONCURRENCY: string;
    BUILD_MAX_CPU_COUNT: string;
    BUILD_CONFIGURATION: string;
    BUILD_PLATFORM: string;
    BUILD_ARCHITECTURE: string;
    MAX_NUNIT_AGENTS: string;
    BUILD_INCLUDE: string;
    BUILD_EXCLUDE: string;
    BUILD_ADDITIONAL_EXCLUDE: string;
    DOTNET_CORE: string;
    DOTNET_TEST_PARALLEL: string;
    NUNIT_ARCHITECTURE: string;
    BUILD_REPORT_XML: string;
    NUNIT_LABELS: string;
    NUNIT_PROCESS: string;
    TEST_INCLUDE: string;
    TEST_EXCLUDE: string;
    TEST_VERBOSITY: string;
    BUILD_TOOLSVERSION: string;
    BUILD_TARGETS: string;
    BUILD_VERBOSITY: string;
    COVERAGE_INCLUDE: string;
    COVERAGE_EXCLUDE: string;
    COVERAGE_ADDITIONAL_EXCLUDE: string;
    COVERAGE_INCLUDE_ASSEMBLIES: string;
    COVERAGE_EXCLUDE_ASSEMBLIES: string;
    COVERAGE_XML: string;
    COVERAGE_REPORTING_EXCLUDE: string;
    BUILD_TOOLS_FOLDER: string;
    DRY_RUN: string;
    GIT_OVERRIDE_BRANCH: string;
    GIT_BRANCH: string;
    GIT_OVERRIDE_REMOTE: string;
    NUGET_API_KEY: string;
    DOTNET_PUBLISH_RUNTIMES: string;
    DOTNET_PUBLISH_BUILD_CONFIGURATION: string;
    OUTPUT: string;
    PURGE_JS_DIRS: string;
    PURGE_DOTNET_DIRS: string;
    PURGE_ADDITIONAL_DIRS: string;
    PACKAGE_TARGET_FOLDER: string;
    PACK_EXCLUDE: string;
    PACK_INCLUDE: string;
    PACK_CONFIGURATION: string;
    PACK_INCREMENT_VERSION: string;
    PACK_INCREMENT_VERSION_BY: string;
    PACKAGE_JSON: string;
    VERSION_INCREMENT_STRATEGY: string;
    VERSION_INCREMENT_ZERO: string;
    INITIAL_RELEASE: string;
    INCLUDE_PACKAGE_JSON: string;
    EXCLUDE_PACKAGE_JSON: string;
    UPDATE_SUBMODULES_TO_LATEST: string;
    ENFORCE_VERIFICATION: string;
    GIT_MAIN_BRANCH: string;
    GIT_VERIFY_BRANCH: string;
    SKIP_FETCH_ON_VERIFY: string;
    GIT_FETCH_TIMEOUT: string;
    GIT_VERIFY_TIMEOUT: string;
    GIT_FETCH_RECENT_TIME: string;
  }


  type StatFunction = (path: string) => Promise<fs.Stats | null>

  // module defs: get these via requireModule<T>("module-name");
  type ReadTextFile = (path: string) => Promise<string>;
  type WriteTextFile = (path: string, data: string, options?: { encoding?: string | null, mode?: string | number, flag?: string | number } | string | null) => Promise<void>
  type ParseXml = (data: string) => Promise<Dictionary<any>>;
  type IncrementVersion = (version: string, strategy: string, zeroLowerOrder: boolean, incrementBy: number)
    => string;
  type ReadPackageVersion = (packageJsonPath?: string) => string | undefined;
  type ReadNuspecVersion = (pathToNuspec: string) => string | undefined;
  type ReadCsProjVersion = (pathToCsProj: string) => string | undefined;
  type ReadCsProjPackageVersion = (pathToCsProj: string) => string | undefined;
  type GatherPaths = (pathSpecs: string | string[]) => Promise<string[]>;
  type PromisifyStream = (stream: Stream) => Promise<void>;
  type AlterPackageJson = (opts?: AlterPackageJsonVersionOptions) => Promise<void>;
  type Rimraf = (at: string, opts?: RimrafOptions) => Promise<void>;
  type ReadPackageJson = (at?: string) => Promise<PackageIndex>;
  type Exec =
    ((cmd: string, args?: string[], opts?: ExecOpts, handlers?: IoHandlers) => Promise<string>) & {
    alwaysSuppressOutput: boolean
  };
  type Uniq = (values: any[]) => any[];

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

  export interface FileSystemUtils {
    folderExists(at: string): Promise<boolean>;
    fileExists(at: string): Promise<boolean>;
    stat(p: string): Promise<StatsBase<any>>;
    readFile(p: string, opts: any): Promise<Buffer | string>;
    readdir(p: string): Promise<string[]>;
    mkdir(p: string, opts: any): Promise<void>;
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

  type GitTagFromCsProj = (options?: GitTagFromCsProjOptions) => Stream;
  type GitFetch = (all: boolean) => Promise<void>;

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

  type ReadGitCommitDeltaCount = (mainBranch: string, otherBranch: string) => Promise<GitCommitDeltaCount>;
  type ReadMainBranchName = () => Promise<string | undefined>;

  interface GitCommitDeltaCount {
    behind: number;
    ahead: number;
  }

  interface GitTagFromCsProjOptions extends GitTagOptions {
    push?: boolean;
  }

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
  }
  interface GitPushOptions {
    dryRun?: boolean;
    quiet?: boolean;
    where?: string
  }
  type GitTag = (tag: string | GitTagOptions, comment?: string, where?: string) => Promise<void>;
  type GitPush = (dryRun?: boolean | GitPushOptions, quiet?: boolean, where?: string) => Promise<void>;
  type GitPushTags = (dryRun?: boolean | GitPushOptions, comment?: string, where?: string) => Promise<void>;

  type StdioOptions = "pipe" | "ignore" | "inherit" |
    Array<("pipe" | "ipc" | "ignore" | "inherit" | any | number | null | undefined)>;

  type BufferConsumer = (data: Buffer) => void;
  type ProcessIO = string | BufferConsumer

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

    detached?: boolean;
  }

  type Spawn = (program: string, args: string[], options?: SpawnOptions)
    => Promise<number>;

  interface GulpUtil {
    PluginError: PluginError;
    log: Logger;
    colors: StyleFunction;
  }
  interface PluginError extends Error {
    new(pluginName: string, err: string | Error): void;
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
