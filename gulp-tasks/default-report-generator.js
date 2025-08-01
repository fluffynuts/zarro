"use strict";
(function () {
    const gulp = requireModule("gulp"), path = require("path"), findTool = requireModule("test-util-finder").findTool, { system } = require("system-wrapper"), quoteIfRequired = requireModule("quote-if-required"), { rm, mkdir, exists } = require("yafs"), env = requireModule("env");
    env.associate(["COVERAGE_XML", "COVERAGE_REPORTING_EXCLUDE"], "cover-dotnet");
    gulp.task("default-report-generator", `Generates HTML reports from existing coverage XML reports`, async () => {
        const reportGenerator = findTool("ReportGenerator.exe");
        if (!reportGenerator) {
            return Promise.reject("No ReportGenerator.exe found in tools folder");
        }
        const coverageXml = env.resolve("COVERAGE_XML");
        if (!await exists(coverageXml)) {
            return Promise.reject(`Can't find ${coverageXml}`);
        }
        const inclusions = env.resolveArray("COVERAGE_INCLUDE");
        const exclusions = env
            .resolveArray("COVERAGE_EXCLUDE")
            .concat(env.resolveArray("COVERAGE_ADDITIONAL_EXCLUDE"))
            .filter(e => inclusions.indexOf(e) === -1);
        const coverageExclude = exclusions.map(e => `-${e}`).join(";"), coverageInclude = inclusions.map(e => `+${e}`).join(";"), assemblyfilters = `${coverageInclude};${coverageExclude}`;
        return system(reportGenerator, [
            `-reports:${quoteIfRequired(coverageXml)}`,
            `-targetdir:${quoteIfRequired(path.join("buildreports", "coverage"))}`,
            `"-assemblyfilters:${assemblyfilters}"`
        ]);
    });
    gulp.task("clean-reports", `Cleans out the build reports folder`, async () => {
        const buildReportsFolder = path.dirname(env.resolve("COVERAGE_XML")), alreadyExists = await exists(buildReportsFolder);
        if (alreadyExists) {
            await rm(buildReportsFolder);
        }
        await mkdir(buildReportsFolder);
    });
})();
