import { ChildProcess, SpawnOptionsWithStdioTuple, StdioNull } from "child_process";

(function() {
  const
    os = require("os"),
    debug = requireModule<DebugFactory>("debug")(__filename),
    isWindows = os.platform() === "win32",
    which = requireModule<Which>("which"),
    createTempFile = requireModule<CreateTempFile>("create-temp-file"),
    quoteIfRequired = requireModule<QuoteIfRequired>("quote-if-required"),
    SystemError = requireModule<SystemError>("system-error"),
    LineBuffer = requireModule<LineBuffer>("line-buffer"),
    child_process = require("child_process"),
    { fileExists } = require("yafs"),
    SystemResult = requireModule<SystemResult>("system-result");

  interface StdIoCollectors {
    stdout: string[];
    stderr: string[];
  }

  interface SpawnOptionsWithContext
    extends SpawnOptions {
    collectors: StdIoCollectors;
  }

  function fillOut(opts?: SpawnOptions): SpawnOptionsWithContext {
    const result = (opts || {}) as SpawnOptionsWithContext;
    result.collectors = {
      stdout: [] as string[],
      stderr: [] as string[]
    };
    return result;
  }

  function trimQuotes(cmd: string) {
    if (!cmd) {
      return cmd;
    }
    if (cmd[0] === '"' && cmd[cmd.length - 1] === '"') {
      return cmd.substring(1, cmd.length - 1);
    }
    return cmd;
  }

  async function wrapLongCommandIntoScript(
    program: string,
    // NB: program args will be modified
    programArgs: string[]
  ): Promise<string> {
    // assume it's a long commandline
    const search = isWindows
      ? "cmd.exe"
      : "sh";
    const exe = which(search);
    if (!exe) {
      throw new SystemError(
        `Unable to find system shell '${ search }' in path`,
        program,
        programArgs,
        -1,
        [],
        []
      );
    }
    const tempFileContents = [ program ].concat(
      programArgs.map(quoteIfRequired)
    ).join(" ");
    const pre = isWindows
      ? "@echo off"
      : "";
    const tempFile = await createTempFile(
      `
${ pre }
${ tempFileContents }
        `.trim()
    );
    programArgs.splice(0, programArgs.length);
    if (isWindows) {
      programArgs.push("/c");
    }
    programArgs.push(tempFile.path);
    return exe;
  }

  async function system(
    program: string,
    args?: string[],
    options?: SystemOptions
  ): Promise<SystemResult> {
    let alreadyExited = false;
    const opts = fillOut(options);
    if (opts.suppressOutput === undefined) {
      opts.suppressOutput = !!opts.stderr || !!opts.stdout;
    }
    let
      exe = trimQuotes(program) as Optional<string>,
      programArgs = args || [] as string[];
    const noArgs = !args || args.length === 0;
    if (!which(program) && noArgs) {
      exe = await wrapLongCommandIntoScript(
        program,
        programArgs
      );
    }
    if (!await fileExists(`${ exe }`)) {
      const pathed = which(`${ exe }`);
      if (!pathed) {
        throw new Error(`${ exe }: file not found and not in the PATH`);
      }
      exe = pathed;
    }
    if (opts.shell) {
      exe = quoteIfRequired(exe);
    }
    const spawnOptions = {
      windowsHide: opts.windowsHide,
      windowsVerbatimArguments: opts.windowsVerbatimArguments,
      timeout: opts.timeout,
      cwd: opts.cwd,
      argv0: opts.argv0,
      shell: opts.shell,
      uid: opts.uid,
      gid: opts.gid,
      env: opts.env || process.env,
      detached: opts.detached || false,
      stdio: [
        "inherit",
        opts.interactive ? "inherit" : "pipe",
        opts.interactive ? "inherit" : "pipe"
      ]
    } satisfies SpawnOptionsWithStdioTuple<any, any, any>;
    debug("launching", {
      exe,
      programArgs,
      spawnOptions
    });
    const result = new SystemResult(`${ exe }`, programArgs, undefined, [], []);
    return new Promise<SystemResult>((resolve, reject) => {
      const child = child_process.spawn(
        exe,
        programArgs as ReadonlyArray<string>,
        spawnOptions as SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioNull>
      );
      if (!!options) {
        const optsWithKill = options as SystemOptionsWithKill;
        optsWithKill.kill = (signal?: NodeJS.Signals | number) => {
          destroyPipesOn(child);
          child.kill(signal);
        };
        if (optsWithKill?.onChildSpawned) {
          try {
            optsWithKill.onChildSpawned(child, optsWithKill);
          } catch (e) {
            // suppress
          }
        }
      }
      const stdoutFn = typeof opts.stdout === "function" ? opts.stdout : noop;
      const stderrFn = typeof opts.stderr === "function" ? opts.stderr : noop;
      const
        stdoutLineBuffer = new LineBuffer(s => {
          result.stdout.push(s);
          stdoutFn(s);
          if (opts.suppressOutput) {
            return;
          }
          console.log(s);
        }),
        stderrLineBuffer = new LineBuffer(s => {
          result.stderr.push(s);
          stderrFn(s);
          if (opts.suppressOutput) {
            return;
          }
          console.error(s);
        });
      child.stdout.on("data", handleStdIo(stdoutLineBuffer));
      child.stderr.on("data", handleStdIo(stderrLineBuffer));

      child.on("error", handleError);
      child.on("exit", handleExit.bind(null, "exit"));
      child.on("close", handleExit.bind(null, "close"));

      function handleError(e: string) {
        if (hasExited()) {
          return;
        }
        debug("child errors", e);
        return reject(generateError(
          `Error spawning process: ${ e }\n${ exe } ${ programArgs.map(q) }`
        ));
      }

      function handleExit(
        ctx: string,
        code: number
      ) {
        if (hasExited()) {
          return;
        }
        debug(`child exited with code: ${ code }`);
        const moreInfo = generateMoreInfo(result);
        if (code) {
          const errResult = generateError(
            `Process exited (${ ctx }) with non-zero code: ${ code }\n${ moreInfo }`.trim(),
            code
          );
          return reject(errResult);
        }
        result.exitCode = code;
        return resolve(result);
      }

      function generateMoreInfo(
        result: SystemResult
      ): string {
        if (!result) {
          return "(no more info available)";
        }
        const lines = [
          "attempted to run:",
          generateCommandLineFor(result)
        ];
        if (result.stderr && result.stderr.length) {
          lines.push("stderr:");
          for (const line of result.stderr) {
            lines.push(`  ${ line }`);
          }
        }
        if (result.stdout && result.stdout.length) {
          lines.push("stdout:");
          for (const line of result.stdout) {
            lines.push(`  ${ line }`);
          }
        }
        return lines.join("\n");
      }

      function generateCommandLineFor(
        info: SystemCommand
      ): string {
        return [ info.exe, (info.args || []).map(q).join(" ") ].join(" ");
      }

      function generateError(
        message: string,
        exitCode?: number
      ) {
        if (system.isError(result)) {
          const errorDetails = gatherErrorDetails(result);
          if (errorDetails) {
            message = `${ message }\n${ errorDetails }`;
          }
        }
        return new SystemError(
          message,
          program,
          args,
          exitCode ?? -1,
          result.stdout,
          result.stderr
        );
      }

      const q = requireModule<QuoteIfRequired>("quote-if-required");

      function gatherErrorDetails(
        err: SystemError
      ): string {
        const parts = [];
        if (err) {
          parts.push(`(cmd: ${ err.exe } ${ err.args.map(q).join(" ") })`);
        }
        if (err && err.stderr && err.stderr.length > 0) {
          parts.push(err.stderr[err.stderr.length - 1]);
        }
        if (err && err.stdout && err.stdout.length > 0) {
          parts.push(err.stdout[err.stdout.length - 1]);
        }
        return parts.join("\n");
      }

      function hasExited() {
        if (alreadyExited) {
          return true;
        }
        flushBuffers();
        destroyPipesOn(child);
        alreadyExited = true;
        return false;
      }

      function flushBuffers() {
        if (stderrLineBuffer) {
          stderrLineBuffer.flush();
        }
        if (stdoutLineBuffer) {
          stdoutLineBuffer.flush();
        }
      }
    });
  }

  function handleStdIo(
    lineBuffer: LineBuffer
  ): ((data: Buffer) => void) {
    return (d: Buffer) => {
      lineBuffer.append(d);
    };
  }

  function noop(_: string | Buffer) {
  }

  function destroyPipesOn(child: ChildProcess) {
    for (const pipe of [ child.stdout, child.stderr, child.stdin ]) {
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
        } catch (e) {
          // suppress: if the pipe is already dead, that's fine.
        }
      }
    }
  }

  system.isError = (o: any): o is SystemError => o instanceof SystemError;
  system.isResult = (o: any): o is SystemResult => o instanceof SystemResult;

  module.exports = system;
})();
