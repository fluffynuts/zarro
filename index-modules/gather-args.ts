(function() {
    const debug = requireModule<DebugFactory>("debug")(__filename);
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
        for (let i = 0; i < argv.length; i++) {
          const arg = argv[i];
          if (arg.match(/node_modules\/zarro\/index.js/)) {
            debug(`using entrypoint from argv: ${arg}`);
            return argv.slice(i + 1);
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
