"use strict";
(function () {
    const debug = requireModule("debug")(__filename), gutil = requireModule("gulp-util"), { ls, FsEntities } = require("yafs"), getToolsFolder = requireModule("get-tools-folder"), nuget = requireModule("nuget"), { mkdir } = require("yafs"), ZarroError = requireModule("zarro-error"), env = requireModule("env"), del = require("del"), vars = {
        SKIP_NUGET_UPDATES: "SKIP_NUGET_UPDATES",
        NUGET_SOURCES: "NUGET_SOURCES"
    };
    async function cleanFoldersFrom(toolsFolder) {
        const dirs = await ls(toolsFolder, { entities: FsEntities.folders });
        if (dirs.length) {
            debug(`Will delete the following tools sub-folders:`);
            dirs.forEach((d) => {
                debug(` - ${d}`);
            });
        }
        return del(dirs);
    }
    function generateNugetSourcesOptions(toolSpecifiedSource) {
        if (toolSpecifiedSource) {
            return ["-source", toolSpecifiedSource];
        }
        return (env.resolve(vars.NUGET_SOURCES) || "")
            .split(",")
            .reduce((acc, cur) => acc.concat(cur ? ["-source", cur] : []), []);
    }
    function generateNugetInstallArgsFor(toolSpec, outputDirectory) {
        const quoteIfRequired = requireModule("quote-if-required");
        // accept a tool package in the formats:
        // packagename (eg 'nunit')
        //  - retrieves the package according to the system config (original & default behavior)
        // source/packagename (eg 'proget.mycompany.moo/nunit')
        //  - retrieves the package from the named source (same as nuget.exe install nunit -source proget.mycompany.moo)
        //  - allows consumer to be specific about where the package should come from
        //  - allows third-parties to be specific about their packages being from, eg, nuget.org
        const parts = toolSpec.split("/");
        const toolPackage = parts.splice(parts.length - 1);
        return [
            "install", toolPackage[0], "-OutputDirectory", quoteIfRequired(outputDirectory)
        ].concat(generateNugetSourcesOptions(parts[0]));
    }
    const inProgress = {};
    const keyDelimiter = "||";
    function makeKey(parts) {
        return (parts || [])
            .join(keyDelimiter);
    }
    function splitKey(value) {
        return (value || "")
            .split(keyDelimiter)
            .sort();
    }
    function install(required, overrideToolsFolder) {
        if (!required) {
            throw new ZarroError("No required tools set");
        }
        const requiredTools = Array.isArray(required)
            ? required
            : [required].sort();
        const toolsFolder = overrideToolsFolder || getToolsFolder();
        // TODO: should allow subsequent installations, ie if
        //       a prior install asked for tools "A" and "B", a subsequent
        //       request for "C" should just wait and then do the work
        const key = makeKey(requiredTools);
        let installingPromise = inProgress[key];
        if (installingPromise) {
            debug(`tools installer already running for (${key})...`);
            return installingPromise;
        }
        const inProgressTools = Object.keys(inProgress)
            .map(k => new Set(splitKey(k)));
        const stillRequired = [];
        for (let tool of requiredTools) {
            if (!tool) {
                continue;
            }
            let shouldAdd = false;
            for (let group of inProgressTools) {
                if (group.has(tool.toLowerCase())) {
                    shouldAdd = true;
                    break;
                }
            }
            if (shouldAdd) {
                stillRequired.push(tool);
            }
        }
        const inProgressKey = makeKey(stillRequired);
        return inProgress[inProgressKey] = doInstall(toolsFolder, requiredTools);
    }
    async function doInstall(toolsFolder, requiredTools) {
        const forceNugetUsage = env.resolveFlag(env.BUILD_TOOLS_INSTALL_FORCE_NUGET_EXE);
        if (forceNugetUsage) {
            debug(`${env.BUILD_TOOLS_INSTALL_FORCE_NUGET_EXE} is set truthy - forcing usage of nuget.exe for tool installation`);
            return doInstallViaNugetExe(toolsFolder, requiredTools);
        }
        else {
            debug(`using node-nuget-client for tool installation`);
            return doInstallViaNodeNugetClient(toolsFolder, requiredTools);
        }
    }
    async function doInstallViaNodeNugetClient(toolsFolder, requiredTools) {
        const { ExecStepContext } = require("exec-step"), ctx = new ExecStepContext(), { NugetClient } = require("node-nuget-client");
        for (const tool of requiredTools) {
            await ctx.exec(`Installing local tool: ${tool}`, async () => {
                const spec = tool.includes("/")
                    ? tool
                    : `nuget.org/${tool}`, parts = spec.split("/"), [source, packageId] = parts, client = new NugetClient(source);
                await client.downloadPackage({
                    packageId,
                    output: toolsFolder
                });
            });
        }
    }
    async function doInstallViaNugetExe(toolsFolder, requiredTools) {
        const findLocalNuget = requireModule("find-local-nuget");
        await mkdir(toolsFolder);
        await cleanFoldersFrom(toolsFolder);
        await findLocalNuget(); // ensure it's downloaded, no need to keep reference tho
        await Promise.all((requiredTools || []).map(tool => {
            debug(`install: ${tool}`);
            return nuget(generateNugetInstallArgsFor(tool, toolsFolder)).then(() => {
                gutil.log(gutil.colors.cyan(`installed local tool: ${tool}`));
            });
        }));
        debug("tool installation complete");
    }
    function clean(overrideToolsFolder) {
        const target = overrideToolsFolder || getToolsFolder();
        debug(`cleaning tools folder: '${target}'`);
        // we want to leave, eg, nuget.exe in the tools base folder
        return cleanFoldersFrom(target);
    }
    module.exports = {
        install,
        clean
    };
})();
