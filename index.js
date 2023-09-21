#!/usr/bin/env node
// TODO: this file should be verified as having unix line-endings

const requireModule = require("./gulp-tasks/modules/require-module");
const { init } = requireModule("git-sha");

const
  {
    FsEntities,
    stat,
    ls,
    readTextFile,
    fileExists,
    folderExists,
    readTextFileLines,
    writeTextFile
  } = require("yafs"),
  log = require("./gulp-tasks/modules/log"),
  path = require("path"),
  debug = require("debug")("zarro::main"),
  ZarroError = require("./gulp-tasks/modules/zarro-error"),
  { skip } = require("./gulp-tasks/modules/linq"),
  gatherArgs = require("./index-modules/gather-args");

function requireHandler(name) {
  const result = require(`./index-modules/handlers/${ name }`);
  return { ...result, name };
}

const handlers = [
  requireHandler("init"),
  requireHandler("help"),
  requireHandler("show-env"),
  requireHandler("create-task"),
  // must always come last as it will always volunteer to handle
  requireHandler("invoke-gulp")
];

async function findHandlerFor(args) {
  for (let handler of handlers) {
    debug({
      label: "investigating handler",
      name: handler.name
    });
    if (await handler.test(args)) {
      debug(`  -> invoking handler: ${ handler.name }`);
      return handler.handler;
    }
  }
  return null;
}

const defaultsFile = ".zarro-defaults";

async function createZarroDefaultsEmpty() {
  await writeTextFile(defaultsFile, `# zarro defaults file:
# place one VARIABLE=VALUE per line below
# variables here will not override existing environment variables
#   unless prepended with a bang, ie
#     !VARIABLE=Value
#   so this means anything you set in your package.json, eg with
#   cross-env, will override what's in here unless you've specifically
#   marked the setting in here as forced with !
`);
}

async function loadDefaults() {
  const
    exists = await fileExists(defaultsFile);
  if (!exists) {
    await createZarroDefaultsEmpty();
    return;
  }
  const
    lines = await readTextFileLines(defaultsFile);
  for (const line of lines) {
    const
      [ code, _ ] = splitComment(line);
    if (isEmpty(code)) {
      // comment-only line or empty line
      continue;
    }
    if (looksInvalid(code)) {
      log.warn(`invalid config line in ${ defaultsFile }:\n${ line }`);
      continue;
    }
    const
      parts = code.trim().split("="),
      name = parts[ 0 ],
      value = Array.from(skip(parts, 1)).join("="),
      forced = name[ 0 ] === '!',
      notYetSet = process.env[ name ] === undefined;
    if (notYetSet || forced) {
      const key = name.replace(/^!/, "");
      if (value) {
        debug(`setting env var ${ key } to '${ value }'`);
        process.env[ key ] = value;
      } else {
        debug(`deleting env var ${ key }`);
        delete process.env[ key ];
      }
    } else {
      debug(`env var ${ name } is already set, force it by setting !${ name }=${ value } in ${ defaultsFile }`)
    }
  }
}

function looksInvalid(code) {
  return (code || "").indexOf("=") === -1;
}

function isEmpty(text) {
  return (text || "").trim() === "";
}

function splitComment(line) {
  if (!line) {
    return [ "", "" ];
  }
  const idx = line.indexOf("#");
  if (idx === -1) {
    return [ line, "" ];
  }
  return [ line.substring(0, idx), line.substring(idx + 1) ];
}

async function transpileLocalTasks() {
  await Promise.all([
    transpileTasksUnder("local-tasks"),
    transpileTasksUnder("override-tasks")
  ]);
  const externalTaskFolders = await ls(
      "external-tasks", {
        entities: FsEntities.folders,
        recurse: false,
        fullPaths: true
      }
    ),
    promises = externalTaskFolders.map(
      f => transpileTasksUnder(f)
    );
  await Promise.all(promises);
}

async function transpileTasksUnder(folder) {
  const toTranspile = [];
  const fullPath = path.isAbsolute(folder)
    ? folder
    : path.join(process.cwd(), folder);
  const contents = await ls(fullPath, {
    recurse: false,
    entities: FsEntities.files,
    match: /\.ts$/,
    fullPaths: true
  });
  for (const item of contents) {
    toTranspile.push(item);
  }

  if (toTranspile.length === 0) {
    debug(`no typescript modules found; skipping transpile phase.`);
    return;
  }

  try {
    require("typescript");
  } catch (e) {
    throw new Error(`TypeScript not installed, unable to transpile local tasks: \n- ${ toTranspile.join("\n -") }`);
  }

  try {
    const
      { ExecStepContext } = require("exec-step"),
      ctx = new ExecStepContext(),
      { transpileModule, ModuleKind } = require("typescript");
    for (const src of toTranspile) {
      const test = src.replace(/\.ts$/, ".js");
      if (await fileExists(test)) {
        // assume this is a compilation handled elsewhere
        continue;
      }
      const output = src.replace(/\.ts$/, ".generated.js");
      if (await fileExists(output)) {
        const srcStat = await stat(src);
        const outStat = await stat(output);

        const srcLastModified = srcStat.mtime.getTime();
        const outLastModified = outStat.mtime.getTime();


        if (srcLastModified <= outLastModified) {
          debug(`${ output } modified after ${ src }; skipping transpile`);
          continue;
        }
        debug(`will transpile: ${ src }`);
      }
      await ctx.exec(
        `transpiling ${ src }`,
        async () => {
          const contents = await readTextFile(src);
          const transpiled = transpileModule(contents, {
            compilerOptions: {
              esModuleInterop: true,
              module: ModuleKind.CommonJS,
              target: "es2017"
            }
          }).outputText;
          await writeTextFile(output, transpiled);
        }
      );
    }
  } catch (e) {
    log.error(`one or more typescript modules could not be transpiled:\n${ e }`);
  }
}

(async function () {
  try {
    const rawArgs = await gatherArgs([ path.join(path.dirname(__dirname), ".bin", "zarro"), __filename ]);
    const args = [];
    let shouldChangeDir = false;
    for (const arg of rawArgs) {
      if (arg === "--in") {
        shouldChangeDir = true;
        continue;
      }
      if (shouldChangeDir) {
        log.info(` --- running in ${ arg } ---`);
        process.chdir(arg);
        shouldChangeDir = false;
        continue;
      }
      args.push(arg);
    }
    await Promise.all([
      loadDefaults(),
      init()
    ]);
    await transpileLocalTasks();
    const handler = await findHandlerFor(args);
    if (!handler) {
      throw new ZarroError("no handler for current args");
    }
    if (typeof handler !== "function") {
      throw new ZarroError(`handler for ${ JSON.stringify(args) } is not a function?!`);
    }
    await handler(args);
  } catch (e) {
    debug(e.stack || e);
    process.exit(1);
  }
})();


