"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_step_1 = require("exec-step");
(function () {
    const debug = requireModule("debug")(__filename);
    const system = requireModule("system");
    const { types } = require("util");
    const { isRegExp } = types;
    const ZarroError = requireModule("zarro-error");
    const sleep = requireModule("sleep");
    const path = require("path");
    const { fileExists, readTextFile, ls, FsEntities } = require("yafs");
    const { yellow } = requireModule("ansi-colors");
    const q = requireModule("quote-if-required");
    const { pushIfSet, pushFlag } = requireModule("cli-support");
    const parseXml = requireModule("parse-xml");
    const { readAssemblyVersion, readCsProjProperty, readAssemblyName } = requireModule("csproj-utils");
    const parseNugetSources = requireModule("parse-nuget-sources");
    const updateNuspecVersion = requireModule("update-nuspec-version");
    const readNuspecVersion = requireModule("read-nuspec-version");
    const log = requireModule("log");
    const env = requireModule("env");
    const Version = requireModule("version");
    const SystemError = requireModule("system-error");
    const cache = requireModule("cache");
    const cacheTTLEnvVar = "NUGET_HTTP_CACHE_TTL";
    env.register({
        name: cacheTTLEnvVar,
        default: "300",
        help: "The amount of time, in seconds, to cache nuget query results for (whilst the app is running)"
    });
    const emojiLabels = {
        testing: `🧪 Testing`,
        packing: `📦 Packing`,
        building: `🏗️ Building`,
        cleaning: `🧹 Cleaning`,
        publishing: `🚀 Publishing`
    };
    const asciiLabels = {
        testing: `>>> Testing`,
        packing: `[_] Packing`,
        building: `+++ Building`,
        cleaning: `--- Cleaning`,
        publishing: `*** Publishing`
    };
    const labels = env.resolveFlag(env.NO_COLOR)
        ? asciiLabels
        : emojiLabels;
    let defaultNugetSource;
    function showHeader(label) {
        console.log(yellow(label));
    }
    async function listPackages(csproj) {
        if (!(await fileExists(csproj))) {
            return [];
        }
        const contents = await readTextFile(csproj);
        const xml = await parseXml(contents);
        const pkgRefs = findPackageReferencesOn(xml);
        const result = [];
        for (const ref of pkgRefs) {
            result.push({
                id: ref.$.Include,
                version: ref.$.Version
            });
        }
        return result;
    }
    function getByPath(obj, path) {
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
    function findPackageReferencesOn(xml) {
        const itemGroups = getByPath(xml, "Project.ItemGroup");
        const result = [];
        if (!itemGroups) {
            return result;
        }
        for (const dict of itemGroups) {
            const packageReferences = getByPath(dict, "PackageReference");
            if (packageReferences) {
                result.push.apply(result, packageReferences);
            }
        }
        return result;
    }
    const requiredContainerPackage = "Microsoft.NET.Build.Containers";
    async function publish(opts) {
        if (opts.publishContainer) {
            const packageRefs = await listPackages(opts.target);
            const match = packageRefs.find(
            // nuget package refs are actually case-insensitive, though
            // the constant is of the "proper" casing
            o => o.id.toLowerCase() == requiredContainerPackage.toLowerCase());
            if (!match) {
                throw new ZarroError(`container publish logic requires a nuget package reference for '${requiredContainerPackage}' on project '${opts.target}'`);
            }
        }
        return runOnAllConfigurations(label(`Publishing`), opts, configuration => {
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
        });
    }
    function pushContainerOpts(args, opts) {
        if (!opts.publishContainer) {
            return;
        }
        args.push("-t:PublishContainer");
        pushContainerImageTag(args, opts);
        pushContainerRegistry(args, opts);
        pushContainerImageName(args, opts);
    }
    function pushContainerImageName(args, opts) {
        pushMsbuildPropertyIfSet(args, opts.containerImageName, "ContainerImageName");
    }
    function pushContainerImageTag(args, opts) {
        pushMsbuildPropertyIfSet(args, opts.containerImageTag, "ContainerImageTag");
    }
    function pushContainerRegistry(args, opts) {
        pushMsbuildPropertyIfSet(args, opts.containerRegistry, "ContainerRegistry");
    }
    function pushMsbuildPropertyIfSet(args, value, name) {
        if (!value) {
            return;
        }
        pushMsbuildProperty(args, name, value);
    }
    async function clean(opts) {
        return runOnAllConfigurations(label(`Cleaning`), opts, configuration => {
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
        });
    }
    async function build(opts) {
        return runOnAllConfigurations(label("Building"), opts, configuration => {
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
        });
    }
    function label(str) {
        const match = Object.keys(labels)
            .find(s => s.toLowerCase() === str.toLowerCase());
        return !!match
            ? labels[match]
            : str;
    }
    async function test(opts) {
        const labelText = !!opts.label
            ? `${label("Testing")}`
            : `${opts.label} ${label("Testing")}`;
        return runOnAllConfigurations(labelText, opts, configuration => {
            const args = [
                "test",
                q(opts.target)
            ];
            pushCommonBuildArgs(args, opts, configuration);
            pushIfSet(args, opts.settingsFile, "--settings");
            pushIfSet(args, opts.filter, "--filter");
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
        });
    }
    let tempDbPortIncrements = 0;
    function incrementTempDbPortHintIfFound(env) {
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
        env["TEMPDB_PORT_HINT"] = `${port}`;
    }
    async function listNugetSources() {
        const raw = await runDotNetWith(["nuget", "list", "source"], {
            suppressOutput: true
        });
        if (system.isError(raw)) {
            throw raw;
        }
        return parseNugetSources(raw.stdout);
    }
    async function addNugetSource(opts) {
        validateConfig(opts, o => !!o ? undefined : "no options provided", o => !!o.name ? undefined : "name not provided", o => !!o.url ? undefined : "url not provided");
        const args = [];
        pushIfSet(args, opts.name, "--name");
        pushIfSet(args, opts.username, "--username");
        pushIfSet(args, opts.password, "--password");
        pushFlag(args, opts.storePasswordInClearText, "--store-password-in-clear-text");
        pushIfSet(args, opts.validAuthenticationTypes, "--valid-authentication-types");
        pushIfSet(args, opts.configFile, "--configfile");
        args.push(opts.url);
        const systemArgs = ["nuget", "add", "source"].concat(args);
        let result = await runDotNetWith(systemArgs, { suppressOutput: true });
        if (system.isError(result)) {
            return result;
        }
        if (opts.enabled === false) {
            result = await disableNugetSource(opts.name);
        }
        return result;
    }
    async function removeNugetSource(source) {
        if (!source) {
            return;
        }
        const toRemove = await tryFindConfiguredNugetSource(source);
        if (!toRemove) {
            return;
        }
        await removeNugetSourceByName(toRemove.name);
    }
    async function enableNugetSource(source) {
        const toEnable = await tryFindConfiguredNugetSource(source);
        if (!toEnable) {
            throw new ZarroError(`unable to find source matching: ${JSON.stringify(source)}`);
        }
        return await runDotNetWith(["dotnet", "nuget", "enable", "source", toEnable.name], {
            suppressOutput: true
        });
    }
    async function disableNugetSource(source) {
        const toDisable = await tryFindConfiguredNugetSource(source);
        if (!toDisable) {
            throw new ZarroError(`unable to find source matching: ${JSON.stringify(source)}`);
        }
        return runDotNetWith(["dotnet", "nuget", "disable", "source", toDisable.name], {
            suppressOutput: true
        });
    }
    function stringFor(value) {
        return typeof value === "string"
            ? value
            : undefined;
    }
    async function tryFindConfiguredNugetSource(find) {
        const allSources = await listNugetSources(), name = isNugetSource(find) ? find.name : stringFor(find), url = isNugetSource(find) ? find.url : stringFor(find), re = isRegExp(find) ? find : undefined;
        return findNameMatch() ||
            findUrlOrHostMatch() ||
            findUrlPartialMatch();
        function findUrlOrHostMatch() {
            if (url) {
                const matchByUrl = allSources.filter(o => o.url.toLowerCase() === url.toLowerCase());
                if (!!matchByUrl.length) {
                    return single(matchByUrl);
                }
                let matchByHost = [];
                try {
                    const host = hostFor(url);
                    matchByHost = allSources.filter(o => {
                        try {
                            const sourceUrl = new URL(o.url);
                            return sourceUrl.host === host;
                        }
                        catch (e) {
                            return false;
                        }
                    });
                }
                catch (e) {
                    // suppress: we probably get here when url is not a valid url
                }
                if (!!matchByHost.length) {
                    return single(matchByHost);
                }
            }
        }
        function findUrlPartialMatch() {
            if (re) {
                const matchByPartialUrl = allSources.filter(o => !!o.url.match(re));
                if (!!matchByPartialUrl.length) {
                    return single(matchByPartialUrl);
                }
            }
        }
        function findNameMatch() {
            if (name) {
                const matchByName = allSources.filter(o => o.name.toLowerCase() === name.toLowerCase());
                if (!!matchByName.length) {
                    return single(matchByName);
                }
            }
        }
        function single(results) {
            if (results.length > 1) {
                throw new ZarroError(`multiple matches for nuget source by name / url / host: ${JSON.stringify(find)}\nfound:\n${JSON.stringify(allSources, null, 2)}`);
            }
            return results[0];
        }
    }
    function hostFor(urlOrHost) {
        try {
            const url = new URL(urlOrHost);
            return url.host;
        }
        catch (e) {
            return urlOrHost;
        }
    }
    function isNugetSource(obj) {
        return typeof obj === "object" &&
            typeof obj.name === "string" &&
            typeof obj.url === "string";
    }
    async function removeNugetSourceByName(find) {
        const source = await tryFindConfiguredNugetSource(find);
        if (!source) {
            throw new ZarroError(`Can't find source with '${find}'`);
        }
        const result = await runDotNetWith(["nuget", "remove", "source", source.name], { suppressOutput: true });
        if (system.isError(result)) {
            throw result;
        }
        return result;
    }
    function validateConfig(opts, ...validators) {
        for (const validator of validators) {
            const result = validator(opts);
            if (result) {
                throw new ZarroError(result);
            }
        }
    }
    async function pack(opts) {
        return runOnAllConfigurations(label("Packing"), opts, async (configuration) => {
            const copy = Object.assign(Object.assign({}, opts), { msbuildProperties: Object.assign({}, opts.msbuildProperties) });
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
            let revert = undefined;
            try {
                if (opts.nuspec && await shouldIncludeNuspec(copy)) {
                    const absoluteNuspecPath = await resolveAbsoluteNuspecPath(opts);
                    copy.msbuildProperties = copy.msbuildProperties || {};
                    copy.msbuildProperties["NuspecFile"] = `${copy.nuspec}`;
                    if (opts.versionSuffix !== undefined) {
                        revert = {
                            path: absoluteNuspecPath,
                            version: await readNuspecVersion(absoluteNuspecPath)
                        };
                        log.warn(`
WARNING: 'dotnet pack' ignores --version-suffix when a nuspec file is provided.
          The version in '${copy.nuspec}' will be temporarily set to ${opts.versionSuffix} whilst
          packing and reverted later.
`.trim());
                        await updateNuspecVersion(absoluteNuspecPath, opts.versionSuffix);
                        // TODO: hook into "after dotnet run" to revert
                    }
                }
                if (!revert) {
                    pushVersionSuffix(args, copy);
                }
                pushMsbuildProperties(args, copy);
                pushAdditionalArgs(args, copy);
                return runDotNetWith(args, copy);
            }
            catch (e) {
                throw e;
            }
            finally {
                if (revert && revert.version !== undefined) {
                    await updateNuspecVersion(revert.path, revert.version);
                }
            }
        });
    }
    function parseNuspecPath(p) {
        if (!p) {
            return {
                resolvedPath: p,
                isOptional: false
            };
        }
        const isOptional = !!p.match(/\?$/), resolvedPath = p.replace(/\?$/, "");
        return {
            isOptional,
            resolvedPath
        };
    }
    async function tryResolveValidPathToNuspec(opts) {
        if (!opts.nuspec) {
            return opts.nuspec;
        }
        const { resolvedPath } = parseNuspecPath(opts.nuspec);
        if (path.isAbsolute(resolvedPath) && await fileExists(resolvedPath)) {
            return opts.nuspec;
        }
        const containerDir = path.dirname(opts.target), resolvedRelativeToProjectPath = path.resolve(path.join(containerDir, resolvedPath));
        if (await fileExists(resolvedRelativeToProjectPath)) {
            return opts.nuspec;
        }
        const resolvedRelativeToCwd = path.join(process.cwd(), resolvedPath);
        if (await fileExists(resolvedRelativeToCwd)) {
            return resolvedRelativeToCwd;
        }
        return opts.nuspec;
    }
    async function resolveAbsoluteNuspecPath(opts) {
        const { resolvedPath } = parseNuspecPath(opts.nuspec);
        if (!resolvedPath) {
            throw new ZarroError(`unable to resolve path to nuspec: no nuspec provided`);
        }
        return path.isAbsolute(resolvedPath)
            ? resolvedPath
            : await resolveNuspecRelativeToProject();
        async function resolveNuspecRelativeToProject() {
            const containerDir = path.dirname(opts.target);
            const test = path.resolve(path.join(containerDir, resolvedPath));
            if (await fileExists(test)) {
                return test;
            }
            throw new ZarroError(`Unable to resolve '${resolvedPath}' relative to '${containerDir}'`);
        }
    }
    async function shouldIncludeNuspec(opts) {
        if (!opts.nuspec) {
            return false;
        }
        const { isOptional, resolvedPath } = parseNuspecPath(opts.nuspec);
        const target = opts.target;
        if (await fileExists(resolvedPath)) {
            opts.nuspec = resolvedPath;
            return true;
        }
        const container = path.dirname(target), resolved = path.resolve(path.join(container, resolvedPath));
        if (await fileExists(resolved)) {
            opts.nuspec = resolvedPath;
            return true;
        }
        if (opts.ignoreMissingNuspec || isOptional) {
            return false;
        }
        throw new ZarroError(`nuspec file not found at '${test}' (from cwd: '${process.cwd()}`);
    }
    async function nugetPush(opts) {
        const pkg = path.basename(opts.target).replace(/\.csproj$/, "");
        const labelText = `Pushing ${pkg}`;
        const ctx = new exec_step_1.ExecStepContext({
            prefixes: {
                wait: "⌛",
                ok: "🚀",
                fail: "⛔"
            }
        });
        return ctx.exec(labelText, async () => {
            validateCommonBuildOptions(opts);
            if (!opts.apiKey) {
                return new SystemError("apiKey was not specified", "", [], 1, [], []);
            }
            const o = opts;
            // the dotnet cli mentions --skip-duplicate, which makes
            // sense for a single package, however, as an outer caller
            // potentially acting on multiple packages will use the
            // pluralized version, and since I've just spent 1/2 an hour
            // figuring this out... let's add some boilerplating.
            if (o.skipDuplicate !== undefined && o.skipDuplicates === undefined) {
                o.skipDuplicates = o.skipDuplicate;
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
            pushFlag(args, opts.skipDuplicates, "--skip-duplicate");
            pushFlag(args, opts.noServiceEndpoint, "--no-service-endpoint");
            pushFlag(args, opts.forceEnglishOutput, "--force-english-output");
            pushAdditionalArgs(args, opts);
            return runDotNetWith(args, opts);
        });
    }
    function pushSelfContainedForPublish(args, opts) {
        if (opts.runtime === undefined) {
            return;
        }
        if (opts.selfContained === undefined) {
            args.push("--self-contained");
            return;
        }
        args.push(opts.selfContained
            ? "--self-contained"
            : "--no-self-contained");
    }
    function pushDisableBuildServers(args, opts) {
        pushFlag(args, opts.disableBuildServers, "--disable-build-servers");
    }
    async function runOnAllConfigurations(label, opts, toRun) {
        validateCommonBuildOptions(opts);
        let configurations = resolveConfigurations(opts);
        if (configurations.length < 1) {
            configurations = [...defaultConfigurations];
        }
        let lastResult;
        for (const configuration of configurations) {
            showHeader(`${label} ${q(opts.target)} with configuration ${configuration}${detailedInfoFor(opts)}`);
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
    function detailedInfoFor(opts) {
        const parts = [
            opts.os,
            opts.arch,
            opts.framework,
            opts.runtime
        ].filter(o => !!o);
        if (parts.length === 0) {
            return "";
        }
        return ` (${parts.join(" ")})`;
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
    const defaultConfigurations = ["default"];
    function resolveConfigurations(opts) {
        if (!opts.configuration) {
            return defaultConfigurations;
        }
        return Array.isArray(opts.configuration)
            ? opts.configuration
            : [opts.configuration];
    }
    function pushFramework(args, opts) {
        pushIfSet(args, opts.framework, "--framework");
    }
    function pushRuntime(args, opts) {
        pushIfSet(args, opts.runtime, "--runtime");
    }
    function pushArch(args, opts) {
        pushIfSet(args, opts.arch, "--arch");
    }
    function pushConfiguration(args, configuration) {
        if (!configuration) {
            return;
        }
        if (configuration.toLowerCase() === "default") {
            return;
        }
        args.push.call(args, "--configuration", configuration);
    }
    function pushCommonBuildArgs(args, opts, configuration) {
        pushVerbosity(args, opts);
        pushTerminalLogger(args, opts);
        pushConfiguration(args, configuration);
        pushFramework(args, opts);
        pushRuntime(args, opts);
        pushArch(args, opts);
        pushOperatingSystem(args, opts);
        pushOutput(args, opts);
    }
    function pushTerminalLogger(args, opts) {
        if (!opts.terminalLogger) {
            return;
        }
        const raw = `${opts.terminalLogger}`.toLowerCase(), sanitized = (raw === "auto" || raw === "off" || raw === "on")
            ? raw
            : "auto";
        args.push(`--tl:${sanitized}`);
    }
    function pushOperatingSystem(args, opts) {
        pushIfSet(args, opts.os, "--os");
    }
    function pushVersionSuffix(args, opts) {
        pushIfSet(args, opts.versionSuffix, "--version-suffix");
    }
    function pushNoRestore(args, opts) {
        pushFlag(args, opts.noRestore, "--no-restore");
    }
    function pushNoBuild(args, opts) {
        pushFlag(args, opts.noBuild, "--no-build");
    }
    function validateCommonBuildOptions(opts) {
        validateConfig(opts, o => !!o ? undefined : "no options provided", o => !!o.target ? undefined : "target not set");
    }
    function pushOutput(args, opts) {
        pushIfSet(args, opts.output, "--output");
    }
    function pushVerbosity(args, opts) {
        pushIfSet(args, opts.verbosity, "--verbosity");
    }
    function pushAdditionalArgs(args, opts) {
        if (opts.additionalArguments) {
            args.push.apply(args, opts.additionalArguments);
        }
    }
    async function runDotNetWith(args, opts) {
        opts = opts || {};
        if (opts.suppressOutput === undefined) {
            opts.suppressOutput = true;
        }
        let result;
        try {
            result = await system("dotnet", args, {
                stdout: opts.stdout,
                stderr: opts.stderr,
                suppressOutput: opts.suppressOutput,
                suppressStdIoInErrors: opts.suppressStdIoInErrors,
                env: opts.env,
                cwd: opts.cwd
            });
        }
        catch (e) {
            if (opts.suppressErrors) {
                return e;
            }
            throw e;
        }
        const errors = result.stderr || [], hasDiedFromException = !!errors.find(s => s.toLowerCase().includes("unhandled exception"));
        if (!hasDiedFromException) {
            return result;
        }
        throw new SystemError(`dotnet exit code is zero, but stdout contains logging about an unhandled exception:\n${errors.join("\n")}`, result.exe, result.args, result.exitCode || Number.MIN_VALUE, result.stdout, result.stderr);
    }
    function pushMsbuildProperties(args, opts) {
        if (!opts.msbuildProperties) {
            return;
        }
        if (hasMsbuildProperties(opts)) {
            for (const key of Object.keys(opts.msbuildProperties)) {
                pushMsbuildProperty(args, key, opts.msbuildProperties[key]);
            }
        }
        else {
            for (const key of Object.keys(opts)) {
                pushMsbuildProperty(args, key, opts[key]);
            }
        }
    }
    function pushMsbuildProperty(args, key, value) {
        args.push(`-p:${q(key)}=${q(value)}`);
    }
    function hasMsbuildProperties(opts) {
        return opts !== undefined && opts.msbuildProperties !== undefined;
    }
    function pushLoggers(args, loggers) {
        if (!loggers) {
            return;
        }
        for (const loggerName of Object.keys(loggers)) {
            const build = [loggerName];
            const options = loggers[loggerName];
            for (const key of Object.keys(options || {})) {
                const value = options[key];
                build.push([key, value].join("="));
            }
            args.push("--logger", `${build.join(";")}`);
        }
    }
    async function resolveContainerOptions(opts) {
        const result = [];
        await pushResolvedContainerOption(result, opts, "containerImageTag", env.DOTNET_PUBLISH_CONTAINER_IMAGE_TAG, () => findFallbackContainerImageTag(opts.target));
        await pushResolvedContainerOption(result, opts, "containerRegistry", env.DOTNET_PUBLISH_CONTAINER_REGISTRY, async () => (await readCsProjProperty(opts.target, "ContainerRegistry", "localhost")));
        await pushResolvedContainerOption(result, opts, "containerImageName", env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME, () => findFallbackContainerImageName(opts.target));
        return result;
    }
    async function findFallbackContainerImageTag(csproj) {
        const specified = await readCsProjProperty(csproj, "ContainerImageTag");
        if (specified) {
            return specified;
        }
        return readAssemblyVersion(csproj);
    }
    async function findFallbackContainerImageName(csproj) {
        const specified = await readCsProjProperty(csproj, "ContainerImageName");
        if (specified) {
            return specified;
        }
        return readAssemblyName(csproj);
    }
    async function pushResolvedContainerOption(collected, opts, option, environmentVariable, fallback) {
        let value = opts[option], usingFallback = false;
        if (!value) {
            value = await fallback();
            usingFallback = true;
        }
        collected.push({
            option,
            value,
            environmentVariable,
            usingFallback
        });
    }
    function parsePackageSearchResult(stdout) {
        const allText = stdout.join(" ");
        let parsed;
        try {
            parsed = JSON.parse(allText);
        }
        catch (e) {
            throw new ZarroError(`Unable to parse json from:\n${allText}`);
        }
        if (parsed.problems && parsed.problems.length) {
            throw new ZarroError(`unable to perform package search (check your access token):\n${parsed.problems.join("\n")}`);
        }
        for (const result of parsed.searchResult || []) {
            for (const pkg of result.packages || []) {
                if (typeof pkg.version === "string") {
                    pkg.version = new Version(pkg.version);
                }
                if (typeof pkg.latestVersion === "string") {
                    pkg.latestVersion = new Version(pkg.latestVersion);
                }
            }
        }
        return parsed;
    }
    async function searchPackages(options) {
        if (!options) {
            throw new ZarroError(`No options or search string provided`);
        }
        const opts = typeof options === "string"
            ? { search: options }
            : options;
        if (opts.skipCache) {
            return await searchPackagesUncached(opts);
        }
        return await cache.through(JSON.stringify(opts), async () => await searchPackagesUncached(opts), env.resolveNumber(cacheTTLEnvVar));
    }
    async function searchPackagesUncached(opts) {
        var _a;
        const args = ["package", "search"];
        pushIfSet(args, opts.source, "--source");
        pushFlag(args, opts.exactMatch, "--exact-match");
        pushFlag(args, opts.preRelease, "--prerelease");
        pushIfSet(args, opts.configFile, "--configfile");
        const skip = opts.skip === undefined ? 0 : opts.skip;
        const take = opts.take === undefined ? 1024 : opts.take;
        args.push("--skip", `${skip}`);
        args.push("--take", `${take}`);
        args.push("--format", "json");
        if (opts.search) {
            args.push(opts.search);
        }
        const stdout = [];
        opts.stdout = (s) => stdout.push(s);
        opts.suppressOutput = true;
        let rawResult;
        try {
            rawResult = await runDotNetWith(args, opts);
        }
        catch (e) {
            if (system.isError(e)) {
                throw wrapSearchError(e);
            }
            throw e;
        }
        if (system.isError(rawResult)) {
            const systemError = rawResult;
            throw wrapSearchError(systemError);
        }
        const parsed = parsePackageSearchResult(stdout);
        debug({
            label: "searchPackagesUncached: response from package repository",
            rawResult,
            parsed
        });
        const finalResult = [];
        for (const sourceResult of parsed.searchResult) {
            for (const pkg of sourceResult.packages) {
                const version = (_a = pkg.latestVersion) !== null && _a !== void 0 ? _a : pkg.version;
                if (!version) {
                    continue;
                }
                finalResult.push({
                    id: pkg.id,
                    version: version,
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
        finalResult.sort((a, b) => a.version.compareWith(b.version)).reverse();
        // some registries don't honor paging (looking at you, GitHub)
        if (skip > 0) {
            finalResult.splice(0, skip);
        }
        if (finalResult.length > take) {
            finalResult.splice(take);
        }
        return finalResult;
    }
    function wrapSearchError(e) {
        return new Error(`Unable to perform package search (check your access token if necessary): ${e}`);
    }
    async function installPackage(opts) {
        if (!opts) {
            throw new ZarroError(`no options passed to 'installPackage' - target project and package name not specified`);
        }
        if (!`${opts.projectFile}`.trim()) {
            throw new ZarroError(`projectFile not specified`);
        }
        if (!`${opts.id}`.trim()) {
            throw new ZarroError(`package id not specified`);
        }
        const args = ["add", opts.projectFile, "package", opts.id];
        pushIfSet(args, opts.version, "--version");
        pushIfSet(args, opts.framework, "--framework");
        pushFlag(args, opts.noRestore, "--no-restore");
        pushIfSet(args, await resolveSourceUrlFor(opts.source), "--source");
        pushIfSet(args, opts.packageDirectory, "--package-directory");
        pushFlag(args, opts.preRelease, "--prerelease");
        if (opts.suppressOutput === undefined) {
            opts.suppressOutput = true;
        }
        return await runDotNetWith(args, opts);
    }
    const defaultCreateOptions = {
        skipTemplateUpdateCheck: true
    };
    const solutionRegex = /.*\.sln$/i;
    function isSolution(filePath) {
        return solutionRegex.test(filePath);
    }
    const projectRegex = /.*\.csproj$/i;
    function isProject(filePath) {
        return projectRegex.test(filePath);
    }
    async function create(opts) {
        verifyExists(opts, `no options passed to create`);
        opts = Object.assign(Object.assign({}, defaultCreateOptions), opts);
        verifyNonEmptyString(opts.template, `template was not specified and is required`);
        const args = ["new", opts.template];
        pushIfSet(args, opts.output, "--output");
        pushIfSet(args, opts.name, "--name");
        pushFlag(args, opts.skipTemplateUpdateCheck, "--no-update-check");
        pushIfSet(args, opts.projectFile, "--project");
        pushIfSet(args, opts.verbosity, "--verbosity");
        pushFlag(args, opts.enableDiagnostics, "--diagnostics");
        if (opts.suppressOutput === undefined) {
            opts.suppressOutput = true;
        }
        const newFiles = await runAndReportNewFiles(opts.cwd, () => runDotNetWith(args, opts));
        return newFiles.find(isSolution)
            || newFiles.find(isProject)
            || newFiles[0];
    }
    async function runAndReportNewFiles(where, toRun) {
        const before = new Set(await listDotNetFilesUnder(where));
        await toRun();
        const after = await listDotNetFilesUnder(where);
        const added = [];
        for (const item of after) {
            if (!before.has(item)) {
                added.push(item);
            }
        }
        return added;
    }
    async function listDotNetFilesUnder(folder) {
        return await ls(folder || ".", {
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
    async function addProjectToSolution(opts) {
        verifyExists(opts, "no options were passed to 'addProjectToSolution'");
        verifyNonEmptyString(opts.projectFile, "path to project file is required");
        verifyNonEmptyString(opts.solutionFile, "path to solution file is required");
        if (!await fileExists(opts.solutionFile)) {
            throw new ZarroError(`file not found: ${opts.solutionFile}`);
        }
        if (!await fileExists(opts.projectFile)) {
            throw new ZarroError(`file not found: ${opts.projectFile}`);
        }
        const args = ["sln", opts.solutionFile, "add", opts.projectFile];
        await runDotNetWith(args, opts);
    }
    async function listProjects(solutionFile) {
        const args = ["sln", solutionFile, "list"], basePath = path.dirname(solutionFile), rawResult = await runDotNetWith(args), result = [];
        for (const line of rawResult.stdout) {
            const trimmed = line.trim(), test = path.join(basePath, trimmed);
            if (await fileExists(test)) {
                result.push(test);
            }
        }
        return result;
    }
    async function resolveSourceUrlFor(source) {
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
    async function upgradePackages(opts) {
        verifyExists(opts, "no options provided to upgradePackages");
        verifyNonEmptyString(opts.pathToProjectOrSolution, "no path to a project or solution was supplied");
        if (!opts.packages || opts.packages.length === 0) {
            throw new ZarroError(`no packages were specified`);
        }
        if (opts.showProgress === undefined) {
            opts.showProgress = true;
        }
        const { ExecStepContext, Labelers } = require("exec-step"), ctx = new ExecStepContext({
            labeler: opts.showProgress
                ? Labelers.interactive
                : Labelers.none
        });
        const projects = isProject(opts.pathToProjectOrSolution)
            ? [opts.pathToProjectOrSolution]
            : await listProjects(opts.pathToProjectOrSolution);
        for (const project of projects) {
            const projectPackages = await listPackages(project);
            const toUpgrade = [];
            for (const pkg of opts.packages) {
                const test = isRegex(pkg)
                    ? (s) => pkg.test(s)
                    : (s) => s.toLowerCase() == pkg.toLowerCase();
                for (const projectPackage of projectPackages) {
                    if (test(projectPackage.id)) {
                        toUpgrade.push(projectPackage);
                    }
                }
            }
            if (toUpgrade.length === 0) {
                if (opts.showProgress) {
                    console.log(`  -> no matching packages to upgrade in '${project}'`);
                }
                continue;
            }
            const s = toUpgrade.length === 1 ? "" : "s", message = `searching for ${toUpgrade.length} package${s} to upgrade in ${project}`, upgradeIds = toUpgrade.map(o => o.id);
            const upstream = await ctx.exec(message, async () => {
                var _a, _b;
                return await searchForMultiplePackages(upgradeIds, opts.source, (_a = opts.preRelease) !== null && _a !== void 0 ? _a : false, (_b = opts.clearNugetHttpCache) !== null && _b !== void 0 ? _b : false);
            });
            if (upstream.length === 0) {
                log.warn(`No results found for packages at ${opts.source} (preRelease: ${!!opts.preRelease})\n- ${upgradeIds.join("\n- ")}`);
            }
            for (const pkg of upstream) {
                const projectMatch = toUpgrade.find(o => o.id.toLowerCase() === pkg.id.toLowerCase());
                if (!projectMatch) {
                    throw new Error(`no matching package reference for '${pkg.id}' in '${project}' (HOW?)`);
                }
                if (pkg.version.equals(projectMatch.version)) {
                    if (opts.showProgress) {
                        console.log(`  ${pkg.id} already at latest version '${pkg.version}' in '${project}'`);
                    }
                    continue;
                }
                ctx.indent += 2;
                await ctx.exec(`installing '${pkg.id}' at version '${pkg.version}' into '${project}'`, async () => await installPackage({
                    projectFile: project,
                    id: pkg.id,
                    version: pkg.version.toString(),
                    source: opts.source,
                    noRestore: opts.noRestore
                }));
                ctx.indent -= 2;
            }
        }
    }
    async function searchForMultiplePackages(packageIds, source, preRelease, clearNugetHttpCache) {
        if (clearNugetHttpCache) {
            await clearCaches(DotNetCache.httpCache);
        }
        // TODO: optimise
        const promises = packageIds.map(id => searchPackages({
            search: id,
            exactMatch: true,
            preRelease,
            source,
            take: 1
        }));
        const allResults = await Promise.all(promises), finalResult = [];
        for (const resultArray of allResults) {
            for (const result of resultArray) {
                finalResult.push(result);
            }
        }
        return finalResult;
    }
    function isRegex(value) {
        return value instanceof RegExp;
    }
    function verifyExists(value, failMessage) {
        if (value === undefined || value === null) {
            throw new ZarroError(failMessage);
        }
    }
    function verifyNonEmptyString(value, failMessage) {
        if (!`${value}`.trim()) {
            throw new ZarroError(failMessage);
        }
    }
    let DotNetCache;
    (function (DotNetCache) {
        DotNetCache["all"] = "all";
        DotNetCache["httpCache"] = "http-cache";
        DotNetCache["globalPackages"] = "global-packages";
        DotNetCache["temp"] = "temp";
    })(DotNetCache || (DotNetCache = {}));
    async function clearCaches(cacheType) {
        const args = ["nuget", "locals", `${cacheType}`, "--clear"];
        let lastError = null;
        for (let i = 0; i < 10; i++) {
            try {
                await runDotNetWith(args);
                return;
            }
            catch (e) {
                lastError = e;
                const allLogs = (lastError.stdout || []).concat(lastError.stderr || []);
                const lockError = !!allLogs.find(s => s.includes("another process"));
                if (lockError) {
                    await sleep(500);
                }
            }
        }
        console.warn(`unable to clear caches:\n${lastError}`);
    }
    clearCaches.all = DotNetCache.all;
    clearCaches.httpCache = DotNetCache.httpCache;
    clearCaches.globalPackages = DotNetCache.globalPackages;
    clearCaches.temp = DotNetCache.temp;
    async function run(opts) {
        verifyExists(opts, `no options passed to create`);
        verifyNonEmptyString(opts.target, `target was not specified`);
        const args = ["run", "--project", opts.target];
        if (!Array.isArray(opts.configuration)) {
            pushConfiguration(args, opts.configuration);
        }
        else {
            if (!opts.configuration) {
                opts.configuration = [];
            }
            if (opts.configuration.length > 1) {
                throw new Error(`you may only specify one configuration for dotnet run`);
            }
            pushConfiguration(args, opts.configuration[0]);
        }
        pushIfSet(args, opts.framework, "--framework");
        pushRuntime(args, opts);
        pushIfSet(args, opts.launchProfile, "--launch-profile");
        pushFlag(args, opts.noLaunchProfile, "--no-launch-profile");
        pushFlag(args, opts.noBuild, "--no-build");
        pushFlag(args, opts.interactive, "--interactive");
        pushFlag(args, opts.noRestore, "--no-restore");
        pushFlag(args, opts.noSelfContained, "--no-self-contained");
        pushFlag(args, opts.selfContained, "--self-contained");
        pushIfSet(args, opts.os, "--os");
        pushFlag(args, opts.disableBuildServers, "--disable-build-servers");
        pushIfSet(args, opts.artifactsPath, "--artifacts-path");
        const programArgs = opts.args || [];
        if (programArgs.length) {
            args.push("--");
            for (const arg of programArgs) {
                args.push(q(arg));
            }
        }
        return runDotNetWith(args);
    }
    module.exports = {
        run,
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
        clearCaches,
        DotNetCache,
        create,
        listProjects,
        addProjectToSolution
    };
})();
