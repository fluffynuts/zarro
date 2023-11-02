import { BufferFile } from "vinyl";
import { StyleFunction } from "ansi-colors";

(function () {
  const
    QUACKERS_LOG_PREFIX = ":quackers_log:",
    QUACKERS_SUMMARY_START_MARKER = `::start_summary::`,
    QUACKERS_SUMMARY_COMPLETE_MARKER = `::summary_complete::`,
    QUACKERS_FAILURE_START_MARKER = `::start_failures::`,
    QUACKERS_FAILURE_INDEX_PLACEHOLDER = "::[#]::",
    QUACKERS_SLOW_INDEX_PLACEHOLDER = "::[-]::",
    QUACKERS_SLOW_SUMMARY_START_MARKER = "::slow_summary_start::",
    QUACKERS_SLOW_SUMMARY_COMPLETE_MARKER = "::slow_summary_complete::",
    QUACKERS_VERBOSE_SUMMARY = "true",
    QUACKERS_OUTPUT_FAILURES_INLINE = "true",
    quackersLogPrefixLength = QUACKERS_LOG_PREFIX.length,
    quackersFullSummaryStartMarker = `${ QUACKERS_LOG_PREFIX }${ QUACKERS_SUMMARY_START_MARKER }`,
    quackersFullSummaryCompleteMarker = `${ QUACKERS_LOG_PREFIX }${ QUACKERS_SUMMARY_COMPLETE_MARKER }`,
    {
      rm,
      ls,
      FsEntities,
      readTextFile,
      mkdir
    } = require("yafs"),
    gulp = requireModule<Gulp>("gulp"),
    log = requireModule<Log>("log"),
    path = require("path"),
    gulpDebug = require("gulp-debug"),
    debug = requireModule<DebugFactory>("debug")(__filename),
    filter = require("gulp-filter"),
    ansiColors = requireModule<AnsiColors>("ansi-colors"),
    promisifyStream = requireModule<PromisifyStream>("promisify-stream"),
    nunitRunner = requireModule<GulpNunitRunner>("gulp-nunit-runner"),
    testUtilFinder = requireModule<TestUtilFinder>("testutil-finder"),
    env = requireModule<Env>("env"),
    resolveTestMasks = requireModule<ResolveTestMasks>("resolve-test-masks"),
    logConfig = requireModule<LogConfig>("log-config"),
    gatherPaths = requireModule<GatherPaths>("gather-paths"),
    { test } = requireModule<DotNetCli>("dotnet-cli"),
    { resolveTestPrefixFor } = requireModule<TestUtils>("test-utils"),
    buildReportFolder = path.dirname(env.resolve("BUILD_REPORT_XML")),
    Version = requireModule<Version>("version"),
    quote = requireModule<QuoteIfRequired>("quote-if-required"),
    netFrameworkTestAssemblyFilter = requireModule<GulpNetFXTestAssemblyFilter>("netfx-test-assembly-filter"),
    {
      baseName,
      chopExtension
    } = requireModule<PathUtils>("path-utils");

  async function runTests() {
    await mkdir(buildReportFolder);
    const dotNetCore = env.resolveFlag("DOTNET_CORE");
    const testMasks = resolveTestMasks(dotNetCore),
      configuration = env.resolve("BUILD_CONFIGURATION"),
      tester = dotNetCore
        ? testAsDotNetCore
        : testWithNunitCli;

    debug({
      tester,
      configuration,
      testMasks
    });
    try {
      await tester(configuration, testMasks);
    } finally {
      await removeTestDiagnostics();
    }
  }

  async function removeTestDiagnostics() {
    const agentLogs = await ls(".", {
      entities: FsEntities.files,
      match: /nunit-agent.*\.log$/,
      fullPaths: true
    });
    const internalTraces = await ls(".", {
      entities: FsEntities.files,
      match: /InternalTrace.*\.log/,
      fullPaths: true
    });

    for (const f of agentLogs.concat(internalTraces)) {
      debug(`delete test diagnostic: ${ f }`);
      await rm(f);
    }
  }

  function consolidatePathEnvVar() {
    const keys = Object.keys(process.env)
      .filter(k => k.toLowerCase() === "path");
    if (keys.length === 1) {
      return;
    }
    const sep = process.platform === "win32"
      ? ";"
      : ":";
    const include = [] as string[];
    keys.forEach(k => {
      const envVar = process.env[k];
      if (!envVar) {
        return;
      }
      const parts = envVar.split(sep);
      parts.forEach(p => {
        if (include.indexOf(p) === -1) {
          include.push(p);
        }
      });
    });
    keys.forEach(k => process.env[k] = "");
    process.env.PATH = include.join(sep);
  }

  function testWithNunitCli(
    configuration: string,
    source: string[]
  ) {
    consolidatePathEnvVar();
    const agents = env.resolveNumber("MAX_NUNIT_AGENTS");
    const seenAssemblies = [] as string[];
    const config = {
      executable: testUtilFinder.latestNUnit({
        architecture: env.resolve("NUNIT_ARCHITECTURE")
      }),
      options: {
        result: env.resolve("BUILD_REPORT_XML"),
        agents: agents,
        labels: env.resolve("NUNIT_LABELS"),
      } as NUnitRunnerOptions
    };
    const nunitProcess = env.resolve("NUNIT_PROCESS");
    const logInfo = {
      result: "Where to store test result (xml file)",
      labels: "What labels NUnit should display as tests run",
      agents: "How many NUnit agents to run"
    } as Dictionary<string>;
    if (nunitProcess !== "auto") {
      config.options.process = nunitProcess;
      logInfo.process = "Process model for NUnit";
    }
    log.info(`Using NUnit runner at ${ config.executable }`);
    log.info("Find files:", source);
    logConfig(config.options, logInfo);
    debug({
      config
    });
    return promisifyStream(
      gulp
        .src(source, {
          read: false
        })
        .pipe(
          filter(netFrameworkTestAssemblyFilter(configuration))
        )
        .pipe(gulpDebug({
          title: "before filter",
          logger: debug
        }))
        .pipe(filter(
          (file: BufferFile) => isDistinctFile(file.path, seenAssemblies)
        ))
        .pipe(gulpDebug({
          title: "after filter",
          logger: debug
        }))
        .pipe(nunitRunner(config))
    );
  }

  function logParallelState(
    testInParallel: boolean,
    parallelFlag: boolean
  ): void {
    if (testInParallel) {
      if (parallelFlag) {
        debug(`parallel testing enabled via DOTNET_TEST_PARALLEL and allows because all test projects use Quackers`);
      } else {
        debug(`parallel testing automatically enabled because all test projects reference Quackers.TestLogger`);
      }
    } else {
      if (parallelFlag) {
        log.warn(`parallel testing was disabled: you should reference Quackers.TestLogger in all test projects for correct output multiplexing`);
      } else {
        log.warn(`parallel testing could not be automatically enabled: you should reference Quackers.TestLogger in all test projects for correct output multiplexing`);
      }
    }
  }

  async function shouldTestInParallel(testProjectPaths: string[]): Promise<boolean> {
    let
      parallelVar = "DOTNET_TEST_PARALLEL",
      parallelFlag = env.resolveFlag(parallelVar),
      testInParallel = parallelFlag,
      allProjectsReferenceQuackers = true;
    for (const project of testProjectPaths) {
      if (!await projectReferencesQuackers(project)) {
        if (env.resolveFlag(env.DOTNET_TEST_PARALLEL)) {
          log.warn(`Parallel testing for dotnet targets disabled because '${ project }' does not reference Quackers.TestLogger`);
        }
        allProjectsReferenceQuackers = false;
        break;
      }
    }

    if (process.env[parallelVar] === undefined) {
      // automatically test in parallel if possible
      testInParallel = allProjectsReferenceQuackers;
      if (testInParallel) {
      } else {
      }
    } else if (parallelFlag && !allProjectsReferenceQuackers) {
      testInParallel = false;
    }
    logParallelState(testInParallel, parallelFlag);
    return testInParallel;
  }

  async function testAsDotNetCore(
    configuration: string,
    testProjects: string[]
  ): Promise<TestResults> {
    const
      runInParallel = requireModule<RunInParallel>("run-in-parallel"),
      testResults = {
        quackersEnabled: false,
        passed: 0,
        failed: 0,
        skipped: 0,
        failureSummary: [],
        slowSummary: [],
        started: Date.now(),
        fullLog: []
      } satisfies TestResults,
      testProcessResults = [] as (SystemResult | SystemError)[],
      testProjectPaths = await gatherPaths(testProjects, true),
      verbosity = env.resolve("BUILD_VERBOSITY");

    const testInParallel = await shouldTestInParallel(testProjectPaths);

    const concurrency = testInParallel
      ? env.resolveNumber("MAX_CONCURRENCY")
      : 1;

    console.log(`Will run tests for project${ testProjectPaths.length === 1 ? "" : "s" } with concurrency ${ concurrency }:`);
    for (const projectPath of testProjectPaths) {
      console.log(`  ${ projectPath }`);
    }

    const tasks = testProjectPaths.map(
      (path, idx) => {
        return async () => {
          debug(`${ idx }  start test run ${ path }`);
          const result = await testOneDotNetCoreProject(
            path,
            configuration,
            verbosity,
            testResults,
            true
          );
          testProcessResults.push(result);
        };
      });
    await runInParallel(
      concurrency,
      ...tasks
    );

    if (testResults.quackersEnabled) {
      logOverallResults(testResults);
    } else {
      console.log("If you install Quackers.TestLogger into your test projects, you'll get a lot more info here!");
    }
    throwIfAnyFailed(testProcessResults);
    return testResults;
  }

  function throwIfAnyFailed(
    testProcessResults: (SystemResult | SystemError)[]) {
    const allErrors = [];
    let haveGenericWarning = false;
    for (const result of testProcessResults) {
      if (!result) {
        continue;
      }
      if (result.exitCode === undefined) {
        continue;
      }
      if (!!result.exitCode) {
        const errors = (result.stderr || []);
        if (errors.length === 0) {
          if (!haveGenericWarning) {
            debug(`Test run fails for: ${ tryFindTestProjectFromTestCli(result.args) }\nstdout: ${ result.stdout.join(
              "\n") }`);
            allErrors.push(`Test run fails for: ${ tryFindTestProjectFromTestCli(result.args) }`);
            haveGenericWarning = true;
          }
        } else {
          allErrors.push(errors.join("\n"));
        }
      }
    }
    if (allErrors.length) {
      throw new Error(`One or more test runs failed:\n\t${ allErrors.join("\n\t") }`);
    }
  }

  function tryFindTestProjectFromTestCli(args: string[]): string {
    let seenTest = false;
    for (const arg of args) {
      if (seenTest) {
        return arg;
      }
      if (arg === "test") {
        seenTest = true;
      }
    }
    return args.map(quote).join(" ");
  }

  function logOverallResults(
    testResults: TestResults
  ) {
    const
      total = testResults.passed + testResults.skipped + testResults.failed,
      now = Date.now(),
      runTimeMs = now - testResults.started,
      runTime = nunitLikeTime(runTimeMs),
      darkerThemeSelected = (process.env["QUACKERS_THEME"] || "").toLowerCase() === "darker",
      red = darkerThemeSelected
        ? ansiColors.red.bind(ansiColors)
        : ansiColors.redBright.bind(ansiColors),
      cyan = darkerThemeSelected
        ? ansiColors.cyan.bind(ansiColors)
        : ansiColors.cyanBright.bind(ansiColors),
      yellow = darkerThemeSelected
        ? ansiColors.yellow.bind(ansiColors)
        : ansiColors.yellowBright.bind(ansiColors);
    logFailures(testResults, red);
    logSlow(testResults, cyan);
    console.log(yellow(`
Test Run Summary
  Overall result: ${ overallResultFor(testResults) }
  Test Count: ${ total }, Passed: ${ testResults.passed }, Failed: ${ testResults.failed }, Skipped: ${ testResults.skipped }, Slow: ${ testResults.slowSummary.length }
  Start time: ${ dateString(testResults.started) }
    End time: ${ dateString(now) }
    Duration: ${ runTime }
`));
    console.log("\n");
  }

  function logSlow(
    testResults: TestResults,
    cyan: StyleFunction
  ) {
    logResultsSection(
      testResults.slowSummary,
      cyan("Slow tests:"),
      QUACKERS_SLOW_INDEX_PLACEHOLDER
    );
  }

  function logFailures(
    testResults: TestResults,
    red: StyleFunction
  ): void {
    logResultsSection(
      testResults.failureSummary,
      red("Failures:"),
      QUACKERS_FAILURE_INDEX_PLACEHOLDER
    );
  }

  function logResultsSection(
    lines: string[],
    heading: string,
    marker: string
  ) {
    if (!lines || lines.length == 0) {
      return;
    }
    console.log(`\n${ heading }`);
    let
      blankLines = 0,
      failIndex = 1;
    for (let line of lines) {
      line = line.trim();
      if (!line) {
        blankLines++;
      } else {
        blankLines = 0;
      }
      if (blankLines > 1) {
        continue;
      }
      const substituted = line.replace(marker, `[${ failIndex }]`);
      if (substituted !== line) {
        failIndex++;
      }
      console.log(substituted);
    }
  }

  function dateString(ms: number) {
    return new Date(ms).toISOString().replace(/T/, " ");
  }

  function overallResultFor(
    testResults: TestResults
  ) {
    if (testResults.failed) {
      return "Failed";
    }
    if (testResults.skipped) {
      return "Warning";
    }
    return "Passed";
  }

  function nunitLikeTime(totalMs: number) {
    const
      ms = totalMs % 1000,
      seconds = Math.floor(totalMs / 1000);
    return `${ seconds }.${ ms } seconds`;
  }

  async function testOneDotNetCoreProject(
    target: string,
    configuration: string,
    verbosity: string,
    testResults: TestResults,
    runningInParallel: boolean,
    forceBuild?: boolean,
    suppressOutput?: boolean
  ): Promise<SystemResult | SystemError> {
    const
      quackersState = {
        inSummary: false, // gather summary info into test results
        inFailureSummary: false,
        inSlowSummary: false,
        // there is some valid logging (eg build) before the first quackers log
        // -> suppress when running in parallel (and by default when sequential)
        haveSeenQuackersLog: runningInParallel || env.resolveFlag("DOTNET_TEST_QUIET_QUACKERS"),
        testResults,
        target,
        fullLog: [] as string[]
      };
    const
      useQuackers = await projectReferencesQuackers(target),
      stderr = useQuackers
        ? quackersStdErrHandler
        : undefined,
      stdout = useQuackers
        ? quackersStdOutHandler.bind(null, quackersState)
        : undefined,
      loggers = useQuackers
        ? { quackers: {} }
        : generateBuiltinConsoleLoggerConfig(),
      prefix = resolveTestPrefixFor(target),
      testEnvironment = generateQuackersEnvironmentVariables(prefix),
      finalVerbosity = useQuackers
        ? "quiet" // if quackers is providing details, quieten down the built-in console logger
        : verbosity;
    await mkdir(buildReportFolder);
    addTrxLoggerTo(loggers, target);
    testResults.quackersEnabled = testResults.quackersEnabled || useQuackers;
    try {
      const result = await test({
        target,
        verbosity: finalVerbosity,
        configuration,
        noBuild: !forceBuild,
        msbuildProperties: env.resolveMap("MSBUILD_PROPERTIES"),
        loggers,
        stderr,
        stdout,
        suppressOutput,
        suppressErrors: true, // we want to collect the errors later, not die when one happens
        env: testEnvironment
      });
      return result;
    } catch (e) {
      debug("WARN: catching SystemError instead of retrieving it");
      const err = e as SystemError;
      return err;
    }
  }

  function addTrxLoggerTo(
    loggers: Dictionary<any>,
    target: string
  ) {
    const
      proj = baseName(target),
      projName = chopExtension(proj),
      logFileName = path.resolve(path.join(buildReportFolder, `${ projName }.trx`));
    loggers.trx = {
      logFileName
    };
  }

  interface QuackersState {
    inSummary: boolean;
    inSlowSummary: boolean;
    inFailureSummary: boolean;
    testResults: TestResults;
    haveSeenQuackersLog: boolean;
    fullLog: string[];
  }

  function quackersStdErrHandler(s: string) {
    debug(`[test stderr]: ${ s }`);
    console.error(s);
  }

  function quackersStdOutHandler(
    state: QuackersState,
    s: string
  ) {
    s = s || "";
    if (s.includes("\n")) {
      const lines = s.split("\n").map(s => s.trimEnd());
      for (const line of lines) {
        quackersStdOutHandler(state, line);
      }
      return;
    }
    state.fullLog.push(s);
    debug(`[test stdout] ${ s }`);
    if (s.startsWith(quackersFullSummaryStartMarker)) {
      debug("  summary starts");
      state.inSummary = true;
      return;
    }
    if (s.startsWith(quackersFullSummaryCompleteMarker)) {
      debug("  summary ends");
      state.inSummary = false;
      return;
    }
    if (state.inSummary) {
      const hasQuackersPrefix = s.startsWith(QUACKERS_LOG_PREFIX);
      if (s.match(/overall/i)) {
        console.log({
          state,
          isQuackersLog: hasQuackersPrefix
        });
      }
      /* actual summary log example, using settings

    QUACKERS_LOG_PREFIX = "::",
    QUACKERS_SUMMARY_START_MARKER = `::SS::`,
    QUACKERS_SUMMARY_COMPLETE_MARKER = `::SC::`,
    QUACKERS_FAILURE_START_MARKER = `::SF::`,
    QUACKERS_FAILURE_INDEX_PLACEHOLDER = "::[#]::",
    QUACKERS_SLOW_INDEX_PLACEHOLDER = "::[-]::",
    QUACKERS_SLOW_SUMMARY_START_MARKER = "::SSS::",
    QUACKERS_SLOW_SUMMARY_COMPLETE_MARKER = "::SSC::",
    QUACKERS_VERBOSE_SUMMARY = "true",
    QUACKERS_OUTPUT_FAILURES_INLINE = "true",

  ::::SS::
  ::::SSS::
  :: {some slow summary data}
  ::::SSC::
  ::
  ::
  ::Test results:
  ::Passed:  8
  ::Failed:  2
  ::Skipped: 1
  ::Total:   11

  ::Failures:

  ::[1] QuackersTestHost.SomeTests.ShouldBeLessThan50(75)
  ::  NExpect.Exceptions.UnmetExpectationException : Expected 75 to be less than 50
  ::     at QuackersTestHost.SomeTests.ShouldBeLessThan50(Int32 value) in C:\code\opensource\quackers\src\Demo\SomeTests.cs:line 66
  ::

  ::[2] QuackersTestHost.SomeTests.ShouldFail
  ::  NExpect.Exceptions.UnmetExpectationException : Expected false but got true
  ::     at QuackersTestHost.SomeTests.ShouldFail() in C:\code\opensource\quackers\src\Demo\SomeTests.cs:line 28
  ::
  ::::SC::
       */
      const line = stripQuackersLogPrefix(s);
      if (line.startsWith(QUACKERS_FAILURE_START_MARKER)) {
        debug("failure summary start");
        state.inFailureSummary = true;
        return;
      }
      if (line.startsWith(QUACKERS_SLOW_SUMMARY_START_MARKER)) {
        debug("slow summary start");
        state.inSlowSummary = true;
        return;
      }
      if (line.startsWith(QUACKERS_SLOW_SUMMARY_COMPLETE_MARKER)) {
        debug("slow summary complete");
        state.inSlowSummary = false;
        return;
      }
      if (state.inFailureSummary) {
        state.testResults.failureSummary.push(line);
        return;
      }
      if (state.inSlowSummary) {
        state.testResults.slowSummary.push(line);
      }
      incrementTestResultCount(state.testResults, line);
      return;
    }
    const isQuackersLog = s.startsWith(QUACKERS_LOG_PREFIX);
    if (s.match(/overall/i)) {
      console.log({
        state,
        isQuackersLog
      });
    }
    if (isQuackersLog) {
      state.haveSeenQuackersLog = true;
    }
    if (!state.haveSeenQuackersLog || isQuackersLog) {
      console.log(stripQuackersLogPrefix(s));
    } else {
      debug(`discarding log: "${ s }"`);
    }
  }

  function incrementTestResultCount(
    testResults: TestResults,
    line: string
  ) {
    const
      parts = line.split(":").map(p => p.trim().toLowerCase()),
      numericPart = line.match(/\d+/) || [ "0" ],
      count = parseInt(numericPart[0]);
    switch (parts[0]) {
      case "passed":
        testResults.passed += count;
        return;
      case "failed":
        testResults.failed += count;
        return;
      case "skipped":
        testResults.skipped += count;
        return;
    }
  }

  function stripQuackersLogPrefix(line: string) {
    return line.substring(quackersLogPrefixLength);
  }

  const quackersRefCache = {} as Dictionary<boolean>;

  async function projectReferencesQuackers(
    csproj: string
  ): Promise<boolean> {
    if (quackersRefCache[csproj] !== undefined) {
      return quackersRefCache[csproj];
    }
    const
      contents = await readTextFile(csproj),
      lines = contents.split("\n").map((l: string) => l.trim());
    for (const line of lines) {
      // FIXME: this requires the packageref to be all on one line, which it may not be, if crafted by a human
      const packageRef = line.match(/<PackageReference\s+Include="Quackers.TestLogger"\s+Version="(?<version>[\d.]+)"/);
      if (packageRef) {
        const
          recommendedVersion = "1.0.16",
          ver = new Version(packageRef.groups["version"]);
        if (ver.isLessThan(recommendedVersion)) {
          console.warn(`${ csproj }: Quackers.TestLogger is out of date. Please upgrade to at least version ${ recommendedVersion }`);
        }
        return quackersRefCache[csproj] = true;
      }
      if (line.match(/<ProjectReference\sInclude=.*Quackers.TestLogger.csproj"/)) {
        return quackersRefCache[csproj] = true;
      }
    }
    return quackersRefCache[csproj] = false;
  }

  function generateBuiltinConsoleLoggerConfig() {
    return {
      console: {
        verbosity: env.resolve("TEST_VERBOSITY")
      }
    };
  }

  function generateQuackersEnvironmentVariables(
    prefix: string
  ): Dictionary<string> {
    const quackersVars = {
      QUACKERS_LOG_PREFIX,
      QUACKERS_SUMMARY_START_MARKER,
      QUACKERS_SUMMARY_COMPLETE_MARKER,
      QUACKERS_FAILURE_START_MARKER,
      QUACKERS_SLOW_SUMMARY_START_MARKER,
      QUACKERS_SLOW_SUMMARY_COMPLETE_MARKER,
      QUACKERS_VERBOSE_SUMMARY,
      QUACKERS_OUTPUT_FAILURES_INLINE,
      QUACKERS_FAILURE_INDEX_PLACEHOLDER,
      QUACKERS_SLOW_INDEX_PLACEHOLDER
    } as Dictionary<string>;
    if (prefix) {
      quackersVars.QUACKERS_TEST_NAME_PREFIX = prefix;
    }
    return { ...process.env, ...quackersVars } as Dictionary<string>;
  }

  function isDistinctFile(
    filePath: string,
    seenFiles: string[]
  ) {
    const basename = path.basename(filePath),
      result = seenFiles.indexOf(basename) === -1;
    if (result) {
      seenFiles.push(basename);
    }
    return result;
  }

  module.exports = {
    runTests,
    testWithNunitCli,
    shouldTestInParallel,
    testOneDotNetCoreProject,
    testAsDotNetCore
  };
})();
