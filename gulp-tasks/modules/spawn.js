"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ansi_colors_1 = require("ansi-colors");
(function () {
    const LineBuffer = requireModule("line-buffer");
    // use for spawning actual processes.
    // You must use exec if you want to run batch files
    const SpawnError = requireModule("spawn-error");
    const SpawnResult = requireModule("spawn-result");
    const tryLoadDebug = function () {
        try {
            return requireModule("debug")(__filename);
        }
        catch (e) {
            return function () {
            };
        }
    }, quoteIfRequired = require("./quote-if-required"), debug = tryLoadDebug(), readline = require("readline"), child_process = require("child_process");
    function clean(data) {
        return (data || "").replace(/\s+$/, "");
    }
    function createEcho(writer) {
        const buffer = new LineBuffer(writer);
        const result = ((s) => {
            buffer.append(s);
        });
        result.flush = () => buffer.flush();
        return result;
    }
    const defaultOptions = {
        stdio: [process.stdin, process.stdout, process.stdin],
        cwd: process.cwd(),
        shell: true,
        lineBuffer: true,
        // default is to echo outputs via a LineBuffer instance
        // -> given captured console.xxx because then we can still
        //    spy and suppress and so on in tests
        stderr: createEcho(s => console.log(s)),
        stdout: createEcho(s => console.error(s))
    };
    // noinspection JSUnusedLocalSymbols
    function nullConsumer(str) {
        // intentionally left blank
    }
    function spawn(executable, commandlineArgs, options) {
        const isShellExec = commandlineArgs === undefined || commandlineArgs === null;
        let args = commandlineArgs || [];
        if (isShellExec) {
            debug("is shell exec");
            debug({
                executable
            });
            const os = require("os"), isWindows = os.platform() === "win32", commandLine = executable;
            executable = isWindows
                ? "cmd"
                : "/bin/bash";
            args = [
                isWindows ? "/c" : "-c",
                commandLine
            ];
        }
        if (options) {
            // if the provided options have properties with the value
            // undefined, they will overwrite the defaults, which is
            // likely not what the consumer expects
            const o = options;
            for (const k of Object.keys(o)) {
                if (o[k] === undefined) {
                    delete o[k];
                }
            }
        }
        const opts = Object.assign(Object.assign({}, defaultOptions), options);
        const q = opts.disableAutomaticQuoting
            ? passThrough
            : quoteIfRequired;
        if (opts.interactive) {
            opts.stderr = undefined;
            opts.stdout = undefined;
        }
        debug("running gulp");
        if (!opts.stdio && defaultOptions.stdio /* this is just to make ts happy*/) {
            opts.stdio = [...defaultOptions.stdio];
        }
        let stdOutWriter = nullConsumer, stdErrWriter = nullConsumer, stdoutFnSpecified = typeof opts.stdout === "function", stderrFnSpecified = typeof opts.stderr === "function";
        let suppressStdOut = !!opts.suppressOutput, suppressStdErr = !!opts.suppressOutput;
        if (opts.detached) {
            opts.stdio = "ignore";
            opts.stdout = undefined;
            opts.stderr = undefined;
        }
        else {
            if ((stdoutFnSpecified || stderrFnSpecified) &&
                !Array.isArray(opts.stdio) &&
                !!defaultOptions.stdio /* just to make ts happy */) {
                opts.stdio = [...defaultOptions.stdio];
            }
            if (stdoutFnSpecified) {
                stdOutWriter = opts.stdout;
                opts.stdio[1] = "pipe";
            }
            else if (Array.isArray(opts.stdio)) {
                opts.stdio[1] = "inherit";
            }
            if (stderrFnSpecified) {
                stdErrWriter = opts.stderr;
                opts.stdio[2] = "pipe";
            }
            else if (Array.isArray(opts.stdio)) {
                opts.stdio[2] = "inherit";
            }
        }
        disableLineBufferWhenUsingInternalLineBuffer(opts);
        const result = new SpawnResult(executable, args, -1, [], []);
        executable = q(executable);
        const quotedArgs = args.map(s => q(s));
        debug(`spawning: ${executable} ${quotedArgs.join(" ")}`);
        debug({ opts });
        return new Promise((resolve, reject) => {
            try {
                const child = child_process.spawn(executable, quotedArgs, opts);
                if (!child) {
                    return reject(new Error(`unable to spawn ${executable} with args [${args.join(",")}]`));
                }
                if (opts.detached) {
                    return resolve(result);
                }
                debug(child);
                const stdout = [];
                const stderr = [];
                child.on("error", (err) => {
                    debug(`child error: ${err}`);
                    destroyPipesOn(child);
                    const e = new SpawnError(`"${[executable].concat(args).join(" ")}" failed with "${err}"`, executable, quotedArgs, -1, opts.suppressStdIoInErrors ? null : stderr, opts.suppressStdIoInErrors ? null : stdout);
                    reject(e);
                });
                let exited = false;
                child.on("exit", generateExitHandler("exit"));
                child.on("close", generateExitHandler("close"));
                let cleared = false;
                const clearColorsOnce = () => {
                    if (cleared) {
                        return;
                    }
                    cleared = true;
                    process.stdout.write((0, ansi_colors_1.reset)("\0"));
                    process.stderr.write((0, ansi_colors_1.reset)("\0"));
                };
                const outWriter = (s) => {
                    clearColorsOnce();
                    stdOutWriter(s);
                };
                const errWriter = (s) => {
                    clearColorsOnce();
                    stdErrWriter(s);
                };
                setupIoHandler(outWriter, child.stdout, stdout, opts, suppressStdOut);
                setupIoHandler(errWriter, child.stderr, stderr, opts, suppressStdErr);
                function flushWriters() {
                    tryFlush(stdOutWriter);
                    tryFlush(stdErrWriter);
                }
                function tryFlush(writer) {
                    const asAugmentedLog = writer;
                    if (!asAugmentedLog.flush) {
                        return;
                    }
                    asAugmentedLog.flush();
                }
                function generateExitHandler(eventName) {
                    return (code) => {
                        if (exited) {
                            return;
                        }
                        destroyPipesOn(child);
                        exited = true;
                        flushWriters();
                        debug(`child ${eventName}s: ${code}`);
                        result.exitCode = code;
                        result.stderr = stderr;
                        result.stdout = stdout;
                        if (code === 0) {
                            resolve(result);
                        }
                        else {
                            const err = new SpawnError(`"${[executable]
                                .concat(args)
                                .join(" ")}" failed with exit code ${code}`, executable, args, code, opts.suppressStdIoInErrors ? null : stdout, opts.suppressStdIoInErrors ? null : stderr);
                            reject(err);
                        }
                    };
                }
            }
            catch (e) {
                reject(`Unable to spawn process: ${e}\n${e.stack}`);
            }
        });
    }
    function setupIoHandler(writer, stream, collector, opts, suppress) {
        if (!stream) {
            return;
        }
        if (!writer) {
            writer = () => {
            };
        }
        function handle(data) {
            if (data === undefined) {
                return;
            }
            if (data instanceof Buffer) {
                data = data.toString();
            }
            collector.push(data);
            if (suppress) {
                return;
            }
            writer(data);
        }
        if (opts.lineBuffer) {
            const rl = readline.createInterface({ input: stream });
            rl.on("line", handle);
        }
        else {
            stream.on("data", handle);
        }
    }
    function destroyPipesOn(child) {
        for (const pipe of [child.stdout, child.stderr, child.stdin]) {
            if (pipe) {
                try {
                    // I've seen times when child processes are dead, but the
                    // IO pipes are kept alive, preventing node from exiting.
                    // Specifically, when running dotnet test against a certain
                    // project - but not in any other project for the same
                    // usage. So this is just a bit of paranoia here - explicitly
                    // shut down any pipes on the child process - we're done
                    // with them anyway
                    pipe.destroy();
                }
                catch (e) {
                    // suppress: if the pipe is already dead, that's fine.
                }
            }
        }
    }
    spawn.SpawnError = SpawnError;
    spawn.SpawnResult = SpawnResult;
    spawn.isSpawnError = function (o) {
        return o instanceof SpawnError;
    };
    spawn.isSpawnResult = function (o) {
        return o instanceof SpawnResult;
    };
    function passThrough(s) {
        return s;
    }
    function disableLineBufferWhenUsingInternalLineBuffer(opts) {
        const out = opts.stdout, err = opts.stderr;
        if (!out || !err) {
            return;
        }
        if (!!out.flush || !!err.flush) {
            opts.lineBuffer = false;
        }
    }
    module.exports = spawn;
})();
