"use strict";
(function () {
    const { system } = require("system-wrapper"), quoteIfRequired = requireModule("quote-if-required"), { splitPath } = requireModule("path-utils"), dotnetCli = require("dotnet-cli"), env = requireModule("env"), resolveNugetApiKey = requireModule("resolve-nuget-api-key"), findLocalNuget = require("./find-local-nuget");
    function isDotnetCore(binaryPath) {
        const trimmed = binaryPath.replace(/^"/, "")
            .replace(/"$/, ""), parts = splitPath(trimmed), executable = (parts[parts.length - 1] || "");
        return !!executable.match(/^dotnet(:?\.exe)?$/i);
    }
    async function pushWithDotnet(opts) {
        return await dotnetCli.nugetPush(opts);
    }
    async function nugetPush(packageFile, sourceName, options) {
        const nugetPushSource = sourceName ||
            env.resolve(env.NUGET_PUSH_SOURCE, env.NUGET_SOURCE) ||
            "nuget.org";
        const apiKey = await resolveNugetApiKey(nugetPushSource);
        options = options || {};
        options.skipDuplicates = options.skipDuplicates === undefined
            ? env.resolveFlag("NUGET_IGNORE_DUPLICATE_PACKAGES")
            : options.skipDuplicates;
        const nuget = await findLocalNuget();
        if (isDotnetCore(nuget)) {
            const dotnetOpts = {
                target: packageFile,
                source: nugetPushSource,
                skipDuplicates: options && options.skipDuplicates,
                apiKey
            };
            return pushWithDotnet(dotnetOpts);
        }
        // legacy mode: olde dotnet nuget code & nuget.exe logic
        const dnc = isDotnetCore(nuget), sourceArg = dnc ? "--source" : "-Source", 
        // ffs dotnet core breaks things that used to be simple
        // -> _some_ nuget commands require 'dotnet nuget ...'
        // -> _others_ don't, eg 'dotnet restore'
        start = dnc ? ["nuget"] : [], args = start.concat([
            "push",
            quoteIfRequired(packageFile),
            sourceArg,
            nugetPushSource || "nuget.org"
        ]), apiKeyArg = dnc ? "-k" : "-ApiKey";
        if (options.skipDuplicates && dnc) {
            args.push("--skip-duplicates");
        }
        if (apiKey) {
            args.push.call(args, apiKeyArg, apiKey);
        }
        else if (dnc) {
            throw new Error("You must set the NUGET_API_KEY environment variable to be able to push packages with the dotnet executable");
        }
        const pushTimeout = env.resolve("NUGET_PUSH_TIMEOUT"), timeout = parseInt(pushTimeout);
        if (!isNaN(timeout)) {
            args.push(dnc ? "-t" : "-Timeout");
            args.push(timeout.toString());
        }
        if (env.resolveFlag("DRY_RUN")) {
            console.log(`nuget publish dry run: ${nuget} ${args.join(" ")}`);
            return;
        }
        console.log(`pushing package ${packageFile}`);
        try {
            await system(nuget, args);
        }
        catch (ex) {
            const e = ex;
            if (Array.isArray(e.stderr)) {
                const errors = e.stderr.join("\n").trim(), isDuplicatePackageError = errors.match(/: 409 /);
                if (isDuplicatePackageError && options.skipDuplicates) {
                    console.warn(`ignoring duplicate package error: ${errors}`);
                }
            }
            throw e;
        }
    }
    module.exports = nugetPush;
})();
