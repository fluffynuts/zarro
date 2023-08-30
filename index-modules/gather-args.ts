(function() {
    module.exports = async function gatherArgs(
        potentialEntryPoints: string | string[],
        overrideArgv?: string[] // for testing only
    ) {
        const argv = overrideArgv || process.argv;
        if (!Array.isArray(potentialEntryPoints)) {
            potentialEntryPoints = [ potentialEntryPoints ];
        }
        for (let entryPoint of potentialEntryPoints) {
            const entryPointIndex = argv.indexOf(entryPoint);
            if (entryPointIndex > -1) {
                return argv.slice(entryPointIndex + 1);
            }
        }
        throw new Error(`Can't figure out args: unable to find entry point in args list:\n${ JSON.stringify(
            {
                potentialEntryPoints,
                overrideArgv,
                argv: process.argv
            },
            null,
            2
        ) }`);
    };
})();
