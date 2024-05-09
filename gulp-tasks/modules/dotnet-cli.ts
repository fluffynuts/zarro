(function () {
  // TODO: perhaps one day, this should become an npm module of its own
  type PerConfigurationFunction = (configuration: string) => Promise<SystemResult | SystemError>;
  const system = requireModule<System>("system");
  const { types } = require("util");
  const { isRegExp } = types;
  const ZarroError = requireModule<ZarroError>("zarro-error");
  const path = require("path");
  const {
    fileExists,
    readTextFile,
    ls,
    FsEntities
  } = require("yafs");
  const { yellow } = requireModule<AnsiColors>("ansi-colors");
  const q = requireModule<QuoteIfRequired>("quote-if-required");
  const {
    pushIfSet,
    pushFlag
  } = requireModule<CliSupport>("cli-support");
  const parseXml = requireModule<ParseXml>("parse-xml");
  const {
    readAssemblyVersion,
    readCsProjProperty,
    readAssemblyName
  } = requireModule<CsProjUtils>("csproj-utils");
  const parseNugetSources = requireModule<ParseNugetSources>("parse-nuget-sources");
  const updateNuspecVersion = requireModule<UpdateNuspecVersion>("update-nuspec-version");
  const readNuspecVersion = requireModule<ReadNuspecVersion>("read-nuspec-version");
  const log = requireModule<Log>("log");
  const env = requireModule<Env>("env");
  const Version = requireModule<Version>("version");
  const SystemError = requireModule<SystemError>("system-error");
  const cache = requireModule<Cache>("cache");

  const emojiLabels = {
    testing: `🧪 Testing`,
    packing: `📦 Packing`,
    building: `🏗️ Building`,
    cleaning: `🧹 Cleaning`,
    publishing: `🚀 Publishing`,
  } as Dictionary<string>;
  const asciiLabels = {
    testing: `>>> Testing`,
    packing: `[_] Packing`,
    building: `+++ Building`,
    cleaning: `--- Cleaning`,
    publishing: `*** Publishing`,
  } as Dictionary<string>;
  const labels = env.resolveFlag(env.NO_COLOR)
    ? asciiLabels
    : emojiLabels;

  let defaultNugetSource: string;

  function showHeader(label: string) {
    console.log(yellow(label));
  }

  async function listPackages(csproj: string): Promise<DotNetPackageReference[]> {
    if (!(await fileExists(csproj))) {
      return [];
    }
    const contents = await readTextFile(csproj);
    const xml = await parseXml(contents) as XmlNode;
    const pkgRefs = findPackageReferencesOn(xml);
    const result = [] as DotNetPackageReference[];
    for (const ref of pkgRefs) {
      result.push({
        id: ref.$.Include,
        version: ref.$.Version
      });
    }
    return result;
  }

  function getByPath(obj: any, path: string): any {
    if (obj === undefined || obj === null) {
      return undefined;
    }
    const parts = path.split(".");
    if (parts.length === 0) {
      return undefined;
    }
    let result = obj;
    do {
      const el = parts.shift();
      if (el === undefined) {
        break;
      }
      result = result[el];
    } while (result !== undefined);

    return result;
  }

  function findPackageReferencesOn(xml: XmlNode): XmlNode[] {
    const itemGroups = getByPath(xml, "Project.ItemGroup") as Dictionary<XmlNode[]>[];
    const result = [] as XmlNode[];
    for (const dict of itemGroups) {
      const packageReferences = getByPath(dict, "PackageReference") as XmlNode[];
      if (packageReferences) {
        result.push.apply(result, packageReferences);
      }
    }
    return result;
  }

  interface XmlNode
    extends Dictionary<XmlNode[] | Dictionary<string>> {
    $: Dictionary<string>
  }

  const requiredContainerPackage = "Microsoft.NET.Build.Containers";

  async function publish(
    opts: DotNetPublishOptions
  ): Promise<SystemResult | SystemError> {
    if (opts.publishContainer) {
      const packageRefs = await listPackages(opts.target);
      const match = packageRefs.find(
        // nuget package refs are actually case-insensitive, though
        // the constant is of the "proper" casing
        o => o.id.toLowerCase() == requiredContainerPackage.toLowerCase()
      );
      if (!match) {
        throw new ZarroError(
          `container publish logic requires a nuget package reference for '${ requiredContainerPackage }' on project '${ opts.target }'`
        )
      }
    }
    return runOnAllConfigurations(
      label(`Publishing`),
      opts,
      configuration => {
        const args = [
          "publish",
          q(opts.target)
        ];
        pushFlag(args, opts.useCurrentRuntime, "--use-current-runtime");
        pushOutput(args, opts);
        pushIfSet(args, opts.manifest, "--manifest");
        pushNoBuild(args, opts);
        pushNoRestore(args, opts);
        pushConfiguration(args, configuration);
        pushFramework(args, opts);
        pushIfSet(args, opts.versionSuffix, "--version-suffix");
        pushRuntime(args, opts);
        pushOperatingSystem(args, opts);
        pushSelfContainedForPublish(args, opts);
        pushArch(args, opts);
        pushDisableBuildServers(args, opts);

        pushContainerOpts(args, opts);

        pushVerbosity(args, opts);
        return runDotNetWith(args, opts);
      }
    )
  }

  function pushContainerOpts(
    args: string[],
    opts: DotNetPublishContainerOptions
  ) {
    if (!opts.publishContainer) {
      return;
    }
    args.push("-t:PublishContainer");
    pushContainerImageTag(args, opts);
    pushContainerRegistry(args, opts);
    pushContainerImageName(args, opts);
  }

  function pushContainerImageName(
    args: string[],
    opts: DotNetPublishContainerOptions
  ) {
    pushMsbuildPropertyIfSet(
      args,
      opts.containerImageName,
      "ContainerImageName"
    )
  }

  function pushContainerImageTag(
    args: string[],
    opts: DotNetPublishContainerOptions
  ) {
    pushMsbuildPropertyIfSet(
      args,
      opts.containerImageTag,
      "ContainerImageTag"
    );
  }

  function pushContainerRegistry(
    args: string[],
    opts: DotNetPublishContainerOptions
  ) {
    pushMsbuildPropertyIfSet(
      args,
      opts.containerRegistry,
      "ContainerRegistry"
    );
  }

  function pushMsbuildPropertyIfSet(
    args: string[],
    value: Optional<string>,
    name: string
  ) {
    if (!value) {
      return;
    }
    pushMsbuildProperty(args, name, value);
  }

  async function clean(
    opts: DotNetCleanOptions
  ): Promise<SystemResult | SystemError> {
    return runOnAllConfigurations(
      label(`Cleaning`),
      opts,
      configuration => {
        const args = [
          "clean",
          q(opts.target)
        ];
        pushFramework(args, opts);
        pushRuntime(args, opts);
        pushConfiguration(args, configuration);
        pushVerbosity(args, opts);
        pushOutput(args, opts);
        pushAdditionalArgs(args, opts);
        return runDotNetWith(args, opts);
      }
    )
  }

  async function build(
    opts: DotNetBuildOptions
  ): Promise<SystemResult | SystemError> {
    return runOnAllConfigurations(
      label("Building"),
      opts,
      configuration => {
        const args = [
          "build",
          q(opts.target)
        ];
        pushCommonBuildArgs(args, opts, configuration);
        pushFlag(args, opts.noIncremental, "--no-incremental");
        pushFlag(args, opts.noDependencies, "--no-dependencies");
        pushFlag(args, opts.noRestore, "--no-restore");
        pushFlag(args, opts.selfContained, "--self-contained");
        pushVersionSuffix(args, opts);
        pushMsbuildProperties(args, opts);
        pushDisableBuildServers(args, opts);
        pushAdditionalArgs(args, opts);

        return runDotNetWith(args, opts);
      }
    );
  }

  function label(str: string): string {
    const match = Object.keys(labels)
      .find(s => s.toLowerCase() === str.toLowerCase());
    return !!match
      ? labels[match]
      : str;
  }

  async function test(
    opts: DotNetTestOptions
  ): Promise<SystemResult | SystemError> {
    const labelText = !!opts.label
      ? `${ label("Testing") }`
      : `${ opts.label } ${ label("Testing") }`;
    return runOnAllConfigurations(
      labelText,
      opts,
      configuration => {
        const args = [
          "test",
          q(opts.target)
        ];
        pushCommonBuildArgs(args, opts, configuration);

        pushIfSet(args, opts.settingsFile, "--settings");
        pushIfSet(args, opts.filter, "--filter")
        pushIfSet(args, opts.diagnostics, "--diag");
        pushNoBuild(args, opts);
        pushNoRestore(args, opts);

        pushLoggers(args, opts.loggers);
        pushMsbuildProperties(args, opts);
        pushAdditionalArgs(args, opts);

        // there's a lot of stdio/stderr from tests, and it
        // should be shown already - including it in the
        // error dump is not only unnecessary, it confuses
        // the test handler wrt quackers output handling
        opts.suppressStdIoInErrors = true;
        incrementTempDbPortHintIfFound(opts.env);
        return runDotNetWith(args, opts);
      }
    );
  }

  let tempDbPortIncrements = 0;

  function incrementTempDbPortHintIfFound(env: Dictionary<string> | undefined): void {
    if (env === undefined) {
      return;
    }
    const current = env["TEMPDB_PORT_HINT"];
    if (current === undefined) {
      return;
    }
    let port = parseInt(current);
    if (isNaN(port)) {
      return;
    }
    port += tempDbPortIncrements++;
    env["TEMPDB_PORT_HINT"] = `${ port }`;
  }

  async function listNugetSources(): Promise<NugetSource[]> {
    const raw = await runDotNetWith(
      [ "nuget", "list", "source" ], {
        suppressOutput: true
      });
    if (system.isError(raw)) {
      throw raw;
    }
    return parseNugetSources(raw.stdout);
  }

  async function addNugetSource(
    opts: NugetAddSourceOptions
  ): Promise<void> {
    validateConfig(
      opts,
      o => !!o ? undefined : "no options provided",
      o => !!o.name ? undefined : "name not provided",
      o => !!o.url ? undefined : "url not provided"
    );
    const args = [] as string[];
    pushIfSet(args, opts.name, "--name");
    pushIfSet(args, opts.username, "--username");
    pushIfSet(args, opts.password, "--password");
    pushFlag(args, opts.storePasswordInClearText, "--store-password-in-clear-text");
    pushIfSet(args, opts.validAuthenticationTypes, "--valid-authentication-types");
    pushIfSet(args, opts.configFile, "--configfile");
    args.push(opts.url);
    const systemArgs = [ "nuget", "add", "source" ].concat(args);
    await runDotNetWith(
      systemArgs,
      { suppressOutput: true }
    );
    if (opts.enabled === false) {
      await disableNugetSource(opts.name);
    }
  }

  async function removeNugetSource(
    source: string | NugetSource
  ): Promise<void> {
    if (!source) {
      return;
    }
    const toRemove = await tryFindConfiguredNugetSource(source);
    if (!toRemove) {
      return;
    }
    await removeNugetSourceByName(toRemove.name);
  }

  async function enableNugetSource(
    source: string | NugetSource
  ): Promise<void> {
    const toEnable = await tryFindConfiguredNugetSource(source);
    if (!toEnable) {
      throw new ZarroError(`unable to find source matching: ${ JSON.stringify(source) }`);
    }
    await runDotNetWith(
      [ "dotnet", "nuget", "enable", "source", toEnable.name ], {
        suppressOutput: true
      }
    );
  }

  async function disableNugetSource(
    source: string | NugetSource
  ): Promise<void> {
    const toDisable = await tryFindConfiguredNugetSource(source);
    if (!toDisable) {
      throw new ZarroError(`unable to find source matching: ${ JSON.stringify(source) }`);
    }
    await runDotNetWith(
      [ "dotnet", "nuget", "disable", "source", toDisable.name ], {
        suppressOutput: true
      }
    );
  }

  function stringFor(value: any): Optional<string> {
    return typeof value === "string"
      ? value as string
      : undefined;
  }

  async function tryFindConfiguredNugetSource(
    find: string | Partial<NugetSource> | RegExp
  ): Promise<Optional<NugetSource>> {
    const
      allSources = await listNugetSources(),
      name = isNugetSource(find) ? find.name : stringFor(find),
      url = isNugetSource(find) ? find.url : stringFor(find),
      re = isRegExp(find) ? find as RegExp : undefined;

    return findNameMatch() ||
           findUrlOrHostMatch() ||
           findUrlPartialMatch();

    function findUrlOrHostMatch() {
      if (url) {
        const matchByUrl = allSources.filter(
          o => o.url.toLowerCase() === url.toLowerCase()
        );
        if (!!matchByUrl.length) {
          return single(matchByUrl);
        }

        let matchByHost: NugetSource[] = [];
        try {
          const host = hostFor(url);
          matchByHost = allSources.filter(
            o => {
              try {
                const sourceUrl = new URL(o.url);
                return sourceUrl.host === host
              } catch (e) {
                return false;
              }
            }
          );
        } catch (e) {
          // suppress: we probably get here when url is not a valid url
        }

        if (!!matchByHost.length) {
          return single(matchByHost);
        }
      }
    }

    function findUrlPartialMatch() {
      if (re) {
        const matchByPartialUrl = allSources.filter(
          o => !!o.url.match(re)
        );
        if (!!matchByPartialUrl.length) {
          return single(matchByPartialUrl);
        }
      }

    }

    function findNameMatch() {
      if (name) {
        const matchByName = allSources.filter(
          o => o.name.toLowerCase() === name.toLowerCase()
        );
        if (!!matchByName.length) {
          return single(matchByName);
        }
      }
    }

    function single(
      results: NugetSource[]
    ) {
      if (results.length > 1) {
        throw new ZarroError(`multiple matches for nuget source by name / url / host: ${
          JSON.stringify(find)
        }\nfound:\n${
          JSON.stringify(allSources, null, 2)
        }`);
      }
      return results[0];
    }
  }

  function hostFor(urlOrHost: string): string {
    try {
      const url = new URL(urlOrHost);
      return url.host;
    } catch (e) {
      return urlOrHost;
    }
  }

  function isNugetSource(obj: any): obj is NugetSource {
    return typeof obj === "object" &&
           typeof obj.name === "string" &&
           typeof obj.url === "string";
  }

  async function removeNugetSourceByName(
    find: string | Partial<NugetSource> | RegExp
  ): Promise<SystemResult | SystemError> {
    const source = await tryFindConfiguredNugetSource(find);
    if (!source) {
      throw new ZarroError(`Can't find source with '${ find }'`);
    }
    const result = await runDotNetWith(
      [ "nuget", "remove", "source", source.name ],
      { suppressOutput: true }
    );
    if (system.isError(result)) {
      throw result;
    }
    return result;
  }

  function validateConfig<T>(
    opts: T,
    ...validators: ((o: T) => Optional<string>)[]
  ) {
    for (const validator of validators) {
      const result = validator(opts);
      if (result) {
        throw new ZarroError(result);
      }
    }
  }

  async function pack(
    opts: DotNetPackOptions
  ): Promise<SystemResult | SystemError> {
    return runOnAllConfigurations(
      label("Packing"),
      opts,
      async configuration => {
        const copy = {
          ...opts,
          msbuildProperties: { ...opts.msbuildProperties }
        }
        copy.nuspec = await tryResolveValidPathToNuspec(copy);
        const args = [
          "pack",
          q(copy.target)
        ];
        pushConfiguration(args, configuration);
        pushVerbosity(args, copy);
        pushOutput(args, copy);
        pushNoBuild(args, copy);

        pushFlag(args, copy.includeSymbols, "--include-symbols");
        pushFlag(args, copy.includeSource, "--include-source");
        pushNoRestore(args, copy);
        let revert = undefined as Optional<RevertVersion>;

        try {
          if (opts.nuspec && await shouldIncludeNuspec(copy)) {
            const absoluteNuspecPath = await resolveAbsoluteNuspecPath(opts);
            copy.msbuildProperties = copy.msbuildProperties || {};
            copy.msbuildProperties["NuspecFile"] = `${ copy.nuspec }`;

            if (opts.versionSuffix !== undefined) {
              revert = {
                path: absoluteNuspecPath,
                version: await readNuspecVersion(absoluteNuspecPath)
              }

              log.warn(`
WARNING: 'dotnet pack' ignores --version-suffix when a nuspec file is provided.
          The version in '${ copy.nuspec }' will be temporarily set to ${ opts.versionSuffix } whilst
          packing and reverted later.
`.trim());

              await updateNuspecVersion(absoluteNuspecPath, opts.versionSuffix);
              // TODO: hook into "after dotnet run" to revert
            }
          }
          if (!revert) {
            pushVersionSuffix(args, copy);
          }
          pushMsbuildProperties(args, copy)
          pushAdditionalArgs(args, copy);
          return await runDotNetWith(args, copy);
        } catch (e) {
          throw e;
        } finally {
          if (revert && revert.version !== undefined) {
            await updateNuspecVersion(revert.path, revert.version);
          }
        }
      }
    );
  }

  function parseNuspecPath(
    p: Optional<string>
  ): { resolvedPath: Optional<string>, isOptional: boolean } {
    if (!p) {
      return {
        resolvedPath: p,
        isOptional: false
      };
    }
    const
      isOptional = !!p.match(/\?$/),
      resolvedPath = p.replace(/\?$/, "");
    return {
      isOptional,
      resolvedPath
    };
  }

  async function tryResolveValidPathToNuspec(
    opts: DotNetPackOptions
  ): Promise<Optional<string>> {
    if (!opts.nuspec) {
      return opts.nuspec;
    }
    const {
      isOptional,
      resolvedPath
    } = parseNuspecPath(opts.nuspec);
    if (path.isAbsolute(resolvedPath) && await fileExists(resolvedPath)) {
      return opts.nuspec;
    }
    const
      containerDir = path.dirname(opts.target),
      resolvedRelativeToProjectPath = path.resolve(path.join(containerDir, resolvedPath));
    if (await fileExists(resolvedRelativeToProjectPath)) {
      return opts.nuspec;
    }

    const resolvedRelativeToCwd = path.join(process.cwd(), resolvedPath);
    if (await fileExists(resolvedRelativeToCwd)) {
      return resolvedRelativeToCwd;
    }
    return opts.nuspec;
  }

  async function resolveAbsoluteNuspecPath(
    opts: DotNetPackOptions
  ): Promise<string> {
    const {
      resolvedPath,
      isOptional
    } = parseNuspecPath(opts.nuspec);
    if (!resolvedPath) {
      throw new ZarroError(`unable to resolve path to nuspec: no nuspec provided`);
    }
    return path.isAbsolute(resolvedPath)
      ? resolvedPath
      : await resolveNuspecRelativeToProject();

    async function resolveNuspecRelativeToProject(): Promise<string> {
      const
        containerDir = path.dirname(opts.target);
      const test = path.resolve(path.join(containerDir, resolvedPath));
      if (await fileExists(test)) {
        return test;
      }
      throw new ZarroError(`Unable to resolve '${ resolvedPath }' relative to '${ containerDir }'`);
    }
  }


  interface RevertVersion {
    path: string;
    version: Optional<string>;
  }

  async function shouldIncludeNuspec(
    opts: DotNetPackOptions
  ): Promise<boolean> {
    if (!opts.nuspec) {
      return false;
    }

    const {
      isOptional,
      resolvedPath
    } = parseNuspecPath(opts.nuspec);

    const
      target = opts.target;

    if (await fileExists(resolvedPath)) {
      opts.nuspec = resolvedPath;
      return true;
    }

    const
      container = path.dirname(target),
      resolved = path.resolve(path.join(container, resolvedPath));
    if (await fileExists(resolved)) {
      opts.nuspec = resolvedPath;
      return true;
    }

    if (opts.ignoreMissingNuspec || isOptional) {
      return false;
    }
    throw new ZarroError(
      `nuspec file not found at '${ test }' (from cwd: '${ process.cwd() }`
    );
  }

  async function nugetPush(
    opts: DotNetNugetPushOptions
  ): Promise<SystemResult | SystemError> {
    validateCommonBuildOptions(opts);
    if (!opts.apiKey) {
      throw new ZarroError("apiKey was not specified");
    }
    const args = [
      "nuget",
      "push",
      opts.target
    ];
    if (opts.apiKey) {
      args.push("--api-key", opts.apiKey);
    }
    if (!opts.source) {
      // dotnet core _demands_ that the source be set.
      opts.source = await determineDefaultNugetSource();
    }
    pushIfSet(args, opts.source, "--source");
    pushIfSet(args, opts.symbolApiKey, "--symbol-api-key");
    pushIfSet(args, opts.symbolSource, "--symbol-source");
    pushIfSet(args, opts.timeout, "--timeout");

    pushFlag(args, opts.disableBuffering, "--disable-buffering");
    pushFlag(args, opts.noSymbols, "--no-symbols");
    pushFlag(args, opts.skipDuplicate, "--skip-duplicate");
    pushFlag(args, opts.noServiceEndpoint, "--no-service-endpoint");
    pushFlag(args, opts.forceEnglishOutput, "--force-english-output");
    pushAdditionalArgs(args, opts);
    return runDotNetWith(args, opts);
  }

  function pushSelfContainedForPublish(
    args: string[],
    opts: DotNetPublishOptions
  ) {
    if (opts.runtime === undefined) {
      return;
    }
    if (opts.selfContained === undefined) {
      args.push("--self-contained");
      return;
    }
    args.push(
      opts.selfContained
        ? "--self-contained"
        : "--no-self-contained"
    );
  }

  function pushDisableBuildServers(args: string[], opts: DotNetPublishOptions) {
    pushFlag(args, opts.disableBuildServers, "--disable-build-servers");
  }

  async function runOnAllConfigurations(
    label: string,
    opts: DotNetCommonBuildOptions,
    toRun: PerConfigurationFunction
  ): Promise<SystemResult | SystemError> {
    validateCommonBuildOptions(opts);
    let configurations = resolveConfigurations(opts);
    if (configurations.length < 1) {
      configurations = [ ...defaultConfigurations ]
    }
    let lastResult: Optional<SystemResult>;
    for (const configuration of configurations) {
      showHeader(`${ label } ${ q(opts.target) } with configuration ${ configuration }${ detailedInfoFor(opts) }`)
      const thisResult = await toRun(configuration);
      if (system.isError(thisResult)) {
        return thisResult;
      }
      lastResult = thisResult;
    }
    // for simplicity: return the last system result (at least for now, until there's a reason to get clever)
    if (lastResult === undefined) {
      // this is really here for TS
      throw new ZarroError(`No build configurations could be determined, which is odd, because there's even a fallback.`);
    }
    return lastResult;
  }

  function detailedInfoFor(opts: DotNetCommonBuildOptions): string {
    const parts = [
      opts.os,
      opts.arch,
      opts.framework,
      opts.runtime
    ].filter(o => !!o);
    if (parts.length === 0) {
      return "";
    }
    return ` (${ parts.join(" ") })`;
  }

  async function determineDefaultNugetSource() {
    if (defaultNugetSource) {
      return defaultNugetSource;
    }
    const args = [
      "nuget",
      "list",
      "source"
    ];
    const systemResult = await system("dotnet", args, {
      suppressOutput: true
    });
    const enabledSources = systemResult.stdout
      .join("\n") // can't guarantee we got lines individually
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.indexOf("[Enabled]") > -1)
      // lines should come through like "  1.  nuget.org [Enabled]"
      .map(l => l.replace(/^\s*\d+\.\s*/, "").replace("[Enabled]", "").trim())
      .sort((a, b) => {
        // try to sort such that nuget.org is at the top, if in the list
        if (a.toLowerCase().indexOf("nuget.org") > -1) {
          return -1;
        }
        if (b.toLowerCase().indexOf("nuget.org") > -1) {
          return 1;
        }
        return 0;
      });
    const result = enabledSources[0];
    if (!result) {
      throw new ZarroError(`Unable to determine default nuget source. Please specify 'source' on your options.`);
    }
    return result;
  }

  // this is actually a viable configuration... but we're going to use
  // it as a flag to not put in -c at all
  const defaultConfigurations = [ "default" ];

  function resolveConfigurations(opts: { configuration?: string | string[] }): string[] {
    if (!opts.configuration) {
      return defaultConfigurations;
    }
    return Array.isArray(opts.configuration)
      ? opts.configuration
      : [ opts.configuration ];
  }

  function pushFramework(args: string[], opts: DotNetTestOptions) {
    pushIfSet(args, opts.framework, "--framework");
  }

  function pushRuntime(args: string[], opts: DotNetTestOptions) {
    pushIfSet(args, opts.runtime, "--runtime");
  }

  function pushArch(args: string[], opts: DotNetTestOptions) {
    pushIfSet(args, opts.arch, "--arch");
  }

  function pushConfiguration(
    args: string[],
    configuration: string
  ) {
    if (!configuration) {
      return;
    }
    if (configuration.toLowerCase() === "default") {
      return;
    }
    args.push.call(args, "--configuration", configuration);
  }

  function pushCommonBuildArgs(
    args: string[],
    opts: DotNetTestOptions,
    configuration: string
  ) {
    pushVerbosity(args, opts);
    pushConfiguration(args, configuration);
    pushFramework(args, opts);
    pushRuntime(args, opts);
    pushArch(args, opts);
    pushOperatingSystem(args, opts);
    pushOutput(args, opts);
  }

  function pushOperatingSystem(args: string[], opts: DotNetTestOptions) {
    pushIfSet(args, opts.os, "--os");
  }

  function pushVersionSuffix(
    args: string[],
    opts: { versionSuffix?: string }
  ) {
    pushIfSet(args, opts.versionSuffix, "--version-suffix");
  }


  function pushNoRestore(
    args: string[],
    opts: { noRestore?: boolean }
  ) {
    pushFlag(args, opts.noRestore, "--no-restore");
  }

  function pushNoBuild(
    args: string[],
    opts: { noBuild?: boolean }
  ) {
    pushFlag(args, opts.noBuild, "--no-build");
  }

  function validateCommonBuildOptions(
    opts: DotNetCommonBuildOptions
  ) {
    validateConfig(
      opts,
      o => !!o ? undefined : "no options provided",
      o => !!o.target ? undefined : "target not set"
    );
  }

  function pushOutput(
    args: string[],
    opts: { output?: string }
  ) {
    pushIfSet(args, opts.output, "--output");
  }

  function pushVerbosity(
    args: string[],
    opts: { verbosity?: string }
  ) {
    pushIfSet(args, opts.verbosity, "--verbosity");
  }

  function pushAdditionalArgs(
    args: string[],
    opts: DotNetTestOptions
  ) {
    if (opts.additionalArguments) {
      args.push.apply(args, opts.additionalArguments);
    }
  }

  async function runDotNetWith(
    args: string[],
    opts?: DotNetBaseOptions
  ): Promise<SystemResult | SystemError> {
    opts = opts || {};
    if (opts.suppressOutput === undefined) {
      opts.suppressOutput = true;
    }
    let result: SystemResult | SystemError | undefined;
    try {
      result = await system("dotnet", args, {
        stdout: opts.stdout,
        stderr: opts.stderr,
        suppressOutput: opts.suppressOutput,
        suppressStdIoInErrors: opts.suppressStdIoInErrors,
        env: opts.env,
        cwd: opts.cwd
      });
    } catch (e) {
      if (opts.suppressErrors) {
        return e as SystemError;
      }
      throw e;
    }

    const
      errors = result.stderr || [],
      hasDiedFromException = !!errors.find(s => s.toLowerCase().includes("unhandled exception"));
    if (!hasDiedFromException) {
      return result;
    }
    throw new SystemError(
      `dotnet exit code is zero, but stdout contains logging about an unhandled exception:\n${ errors.join("\n") }`,
      result.exe,
      result.args,
      result.exitCode || Number.MIN_VALUE,
      result.stdout,
      result.stderr
    )
  }

  function pushMsbuildProperties(
    args: string[],
    opts: DotNetMsBuildOptions | Dictionary<string>
  ) {
    if (!opts.msbuildProperties) {
      return;
    }
    if (hasMsbuildProperties(opts)) {
      for (const key of Object.keys(opts.msbuildProperties)) {
        pushMsbuildProperty(args, key, opts.msbuildProperties[key]);
      }
    } else {
      for (const key of Object.keys(opts)) {
        pushMsbuildProperty(args, key, opts[key]);
      }
    }
  }

  function pushMsbuildProperty(
    args: string[],
    key: string,
    value: string
  ) {
    args.push(
      `-p:${ q(key) }=${ q(value) }`
    )
  }

  function hasMsbuildProperties(opts: any): opts is DotNetMsBuildOptions {
    return opts !== undefined && opts.msbuildProperties !== undefined;
  }

  function pushLoggers(args: string[], loggers: Optional<DotNetTestLoggers>) {
    if (!loggers) {
      return;
    }
    for (const loggerName of Object.keys(loggers)) {
      const build = [ loggerName ];
      const options = loggers[loggerName];
      for (const key of Object.keys(options || {})) {
        const value = options[key];
        build.push([ key, value ].join("="));
      }
      args.push("--logger", `${ build.join(";") }`);
    }
  }

  async function resolveContainerOptions(
    opts: DotNetPublishOptions
  ): Promise<ResolvedContainerOption[]> {
    const result = [] as ResolvedContainerOption[];
    await pushResolvedContainerOption(
      result,
      opts,
      "containerImageTag",
      env.DOTNET_PUBLISH_CONTAINER_IMAGE_TAG,
      () => findFallbackContainerImageTag(opts.target)
    );

    await pushResolvedContainerOption(
      result,
      opts,
      "containerRegistry",
      env.DOTNET_PUBLISH_CONTAINER_REGISTRY,
      async () => (await readCsProjProperty(
        opts.target,
        "ContainerRegistry",
        "localhost"
      )) as string
    );

    await pushResolvedContainerOption(
      result,
      opts,
      "containerImageName",
      env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
      () => findFallbackContainerImageName(opts.target)
    );

    return result;
  }

  async function findFallbackContainerImageTag(
    csproj: string
  ) {
    const specified = await readCsProjProperty(
      csproj,
      "ContainerImageTag"
    );
    if (specified) {
      return specified;
    }
    return readAssemblyVersion(csproj);
  }

  async function findFallbackContainerImageName(
    csproj: string
  ) {
    const specified = await readCsProjProperty(
      csproj,
      "ContainerImageName"
    );
    if (specified) {
      return specified;
    }

    return readAssemblyName(csproj);
  }

  async function pushResolvedContainerOption(
    collected: ResolvedContainerOption[],
    opts: DotNetPublishOptions,
    option: keyof DotNetPublishContainerOptions,
    environmentVariable: string,
    fallback: (() => Promise<string>)
  ): Promise<void> {
    let
      value = opts[option] as string,
      usingFallback = false;
    if (!value) {
      value = await fallback();
      usingFallback = true
    }
    collected.push({
      option,
      value,
      environmentVariable,
      usingFallback
    });
  }

  interface PackageSearchResult {
    version: number;
    problems: string[];
    searchResult: PerSourceSearchResult[];
  }

  interface PerSourceSearchResult {
    sourceName: string;
    problems: any;
    packages: PackageHit[];
  }

  interface PackageHit {
    "total downloads": number;
    owner: string;
    id: string;
    latestVersion: string;
  }

  function parsePackageSearchResult(
    stdout: string[]
  ): PackageSearchResult {
    const
      allText = stdout.join(" ");
    let parsed: PackageSearchResult | undefined;
    try {
      parsed = JSON.parse(allText) as PackageSearchResult;
    } catch (e) {
      throw new ZarroError(`Unable to parse json from:\n${ allText }`);
    }
    if (parsed.problems && parsed.problems.length) {
      throw new ZarroError(`unable to perform package search (check your access token):\n${ parsed.problems.join("\n") }`);
    }
    return parsed;
  }

  async function searchPackages(
    options: DotNetSearchPackagesOptions | string
  ): Promise<PackageInfo[]> {
    if (!options) {
      throw new ZarroError(`No options or search string provided`);
    }

    const opts = typeof options === "string"
      ? { search: options } as DotNetSearchPackagesOptions
      : options;

    if (opts.skipCache) {
      return await searchPackages(opts);
    }

    return await cache.through(
      JSON.stringify(opts),
      async () => await searchPackagesUncached(opts),
      60 // cache for a minute
    );
  }

  async function searchPackagesUncached(
    opts: DotNetSearchPackagesOptions
  ): Promise<PackageInfo[]> {

    const args = [ "package", "search" ] as string[];
    pushIfSet(args, opts.source, "--source");
    pushFlag(args, opts.exactMatch, "--exact-match");
    pushFlag(args, opts.preRelease, "--prerelease");
    pushIfSet(args, opts.configFile, "--configfile");

    const skip = opts.skip === undefined ? 0 : opts.skip;
    const take = opts.take === undefined ? 1024 : opts.take;
    args.push("--skip", `${ skip }`);
    args.push("--take", `${ take }`);

    args.push("--format", "json");
    if (opts.search) {
      args.push(opts.search);
    }

    const stdout = [] as string[]
    opts.stdout = (s: string) => stdout.push(s);
    opts.suppressOutput = true;

    let rawResult: SystemResult | SystemError | undefined;
    try {
      rawResult = await runDotNetWith(args, opts);
    } catch (e: any) {
      if (SystemError.isError(e)) {
        throw wrapSearchError(e as SystemError);
      }
      throw e;
    }
    if (system.isError(rawResult)) {
      const systemError = rawResult as SystemError;
      throw wrapSearchError(systemError);
    }

    const
      parsed = parsePackageSearchResult(stdout);

    const finalResult = [] as PackageInfo[];
    for (const sourceResult of parsed.searchResult) {
      for (const pkg of sourceResult.packages) {
        finalResult.push({
          id: pkg.id,
          version: new Version(pkg.latestVersion),
          source: sourceResult.sourceName
        });
      }
    }

    // dotnet package search takes in skip and take parameters,
    // but there are some potential issues:
    // 1. when searching for an exact match, it dotnet doesn't apply skip/take
    //    - so we'd have to do it ourselves anyway
    // 2. dotnet returns results in ascending version order
    //    - where the most useful, especially for paging, is reverse-ordered
    finalResult.sort(
      (a, b) => a.version.compareWith(b.version)
    ).reverse();
    // some registries don't honor paging (looking at you, GitHub)
    if (skip > 0) {
      finalResult.splice(0, skip);
    }
    if (finalResult.length > take) {
      finalResult.splice(take);
    }
    return finalResult;
  }

  function wrapSearchError(e: SystemError): Error {
    return new Error(`Unable to perform package search (check your access token if necessary): ${ e }`);
  }

  async function installPackage(
    opts: DotNetInstallNugetPackageOption
  ): Promise<void> {
    if (!opts) {
      throw new ZarroError(`no options passed to 'installPackage' - target project and package name not specified`);
    }
    if (!`${ opts.projectFile }`.trim()) {
      throw new ZarroError(`projectFile not specified`);
    }
    if (!`${ opts.id }`.trim()) {
      throw new ZarroError(`package id not specified`);
    }
    const args = [ "add", opts.projectFile, "package", opts.id ];
    pushIfSet(args, opts.version, "--version");
    pushIfSet(args, opts.framework, "--framework");
    pushFlag(args, opts.noRestore, "--no-restore");
    pushIfSet(args, await resolveSourceUrlFor(opts.source), "--source");
    pushIfSet(args, opts.packageDirectory, "--package-directory");
    pushFlag(args, opts.preRelease, "--prerelease");
    if (opts.suppressOutput === undefined) {
      opts.suppressOutput = true;
    }
    await runDotNetWith(args, opts);
  }

  const defaultCreateOptions = {
    skipTemplateUpdateCheck: true
  } as Partial<DotNetCreateOptions>;

  const solutionRegex = /.*\.sln$/i;

  function isSolution(filePath: string): boolean {
    return solutionRegex.test(filePath);
  }

  const projectRegex = /.*\.csproj$/i;

  function isProject(filePath: string): boolean {
    return projectRegex.test(filePath);
  }

  async function create(
    opts: DotNetCreateOptions
  ): Promise<string> {

    verifyExists(opts, `no options passed to create`);
    opts = {
      ...defaultCreateOptions,
      ...opts
    };
    verifyNonEmptyString(opts.template, `template was not specified and is required`);
    const args = [ "new", opts.template ];
    pushIfSet(args, opts.output, "--output");
    pushIfSet(args, opts.name, "--name");
    pushFlag(args, opts.skipTemplateUpdateCheck, "--no-update-check");
    pushIfSet(args, opts.projectFile, "--project");
    pushIfSet(args, opts.verbosity, "--verbosity");
    pushFlag(args, opts.enableDiagnostics, "--diagnostics");
    if (opts.suppressOutput === undefined) {
      opts.suppressOutput = true;
    }
    const newFiles = await runAndReportNewFiles(
      opts.cwd,
      () => runDotNetWith(args, opts)
    );
    return newFiles.find(isSolution)
           || newFiles.find(isProject)
           || newFiles[0];
  }

  async function runAndReportNewFiles(
    where: string | undefined | null,
    toRun: (() => Promise<any>)
  ) {
    const before = new Set<string>(await listDotNetFilesUnder(where));
    await toRun();
    const after = await listDotNetFilesUnder(where);
    const added = [] as string[];
    for (const item of after) {
      if (!before.has(item)) {
        added.push(item);
      }
    }
    return added;
  }

  async function listDotNetFilesUnder(
    folder: string | undefined | null
  ): Promise<string[]> {
    return await ls(
      folder || ".", {
        entities: FsEntities.files,
        fullPaths: true,
        recurse: true,
        doNotTraverse: [
          /node_modules/,
          /[\\/]obj[\\/]/,
          /[\\/]bin[\\/]/
        ]
      });
  }

  async function addProjectToSolution(
    opts: DotNetAddProjectToSolutionOptions
  ): Promise<void> {
    verifyExists(opts, "no options were passed to 'addProjectToSolution'");
    verifyNonEmptyString(opts.projectFile, "path to project file is required");
    verifyNonEmptyString(opts.solutionFile, "path to solution file is required");

    if (!await fileExists(opts.solutionFile)) {
      throw new ZarroError(`file not found: ${ opts.solutionFile }`);
    }
    if (!await fileExists(opts.projectFile)) {
      throw new ZarroError(`file not found: ${ opts.projectFile }`);
    }

    const args = [ "sln", opts.solutionFile, "add", opts.projectFile ];
    await runDotNetWith(args, opts);
  }

  async function listProjects(
    solutionFile: string
  ): Promise<string[]> {
    const
      args = [ "sln", solutionFile, "list" ],
      basePath = path.dirname(solutionFile),
      rawResult = await runDotNetWith(args),
      result = [] as string[];
    for (const line of rawResult.stdout) {
      const
        trimmed = line.trim(),
        test = path.join(basePath, trimmed);
      if (await fileExists(test)) {
        result.push(test);
      }
    }
    return result;
  }

  async function resolveSourceUrlFor(
    source: Optional<string>
  ): Promise<Optional<string>> {
    if (!source) {
      return undefined;
    }
    const lowered = source.toLowerCase();
    const sources = await listNugetSources();
    for (const source of sources) {
      if (source.name.toLowerCase() == lowered) {
        return source.url;
      }
    }
    // hopefully this is a valid source that dotnet understands
    // - in my testing, dotnet doesn't understand source names,
    //   unlike nuget.exe
    return source;
  }


  async function upgradePackages(
    opts: DotNetUpgradePackagesOptions
  ): Promise<void> {
    verifyExists(opts, "no options provided to upgradePackages");
    verifyNonEmptyString(opts.pathToProjectOrSolution, "no path to a project or solution was supplied");
    if (!opts.packages || opts.packages.length === 0) {
      throw new ZarroError(`no packages were specified`);
    }
    if (opts.showProgress === undefined) {
      opts.showProgress = true;
    }

    const
      {
        ExecStepContext,
        Labelers
      } = require("exec-step"),
      ctx = new ExecStepContext({
        labeler: opts.showProgress
          ? Labelers.interactive
          : Labelers.none
      });

    const projects = isProject(opts.pathToProjectOrSolution)
      ? [ opts.pathToProjectOrSolution ]
      : await listProjects(opts.pathToProjectOrSolution);

    for (const project of projects) {
      const projectPackages = await listPackages(project);
      const toUpgrade = [] as string[];
      for (const pkg of opts.packages) {
        const test = isRegex(pkg)
          ? (s: string) => pkg.test(s)
          : (s: string) => projectPackages.find(pp => pp.id.toLowerCase() === s.toLowerCase());

        for (const projectPackage of projectPackages) {
          if (test(projectPackage.id)) {
            toUpgrade.push(projectPackage.id);
          }
        }
      }
      if (toUpgrade.length === 0) {

      }

      const message = `searching for ${ toUpgrade.length } packages to upgrade in ${ project }`;
      const upstream = await ctx.exec(
        ``,
        async () => await searchForMultiplePackages(
          toUpgrade,
          opts.source,
          opts.preRelease ?? false
        )
      );
      for (const pkg of upstream) {
        await ctx.exec(
          ``,
          async () =>
            await installPackage({
              projectFile: project,
              id: pkg.id,
              version: pkg.version.toString(),
              source: opts.source,
              noRestore: opts.noRestore,
              preRelease: opts.preRelease
            })
        );
      }
    }
  }

  async function searchForMultiplePackages(
    packageIds: string[],
    source: string | undefined | null,
    preRelease: boolean
  ): Promise<PackageInfo[]> {
    // TODO: optimise
    const promises = packageIds.map(
      id => searchPackages({
        search: id,
        exactMatch: true,
        preRelease,
        source,
        take: 1
      })
    );
    const
      allResults = await Promise.all(promises),
      finalResult = [] as PackageInfo[];
    for (const resultArray of allResults) {
      for (const result of resultArray) {
        finalResult.push(result);
      }
    }
    return finalResult;
  }


  function isRegex(value: any): value is RegExp {
    return value instanceof RegExp;
  }

  function verifyExists(
    value: object,
    failMessage: string
  ) {
    if (value === undefined || value === null) {
      throw new ZarroError(failMessage);
    }
  }

  function verifyNonEmptyString(
    value: string | undefined | null,
    failMessage: string
  ) {
    if (!`${ value }`.trim()) {
      throw new ZarroError(failMessage);
    }
  }

  module.exports = {
    test,
    build,
    pack,
    clean,
    nugetPush,
    publish,
    listPackages,
    resolveContainerOptions,
    listNugetSources,
    addNugetSource,
    removeNugetSource,
    disableNugetSource,
    enableNugetSource,
    tryFindConfiguredNugetSource,
    incrementTempDbPortHintIfFound,

    searchPackages,
    installPackage,
    upgradePackages,

    create,
    listProjects,
    addProjectToSolution
  };
})
();
