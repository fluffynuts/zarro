/*
  Welcome new user!

  To get started, copy this gulpfile.js to the root of your repo and run:
  `node gulpfile.js`
  You should be guided through the basic setup. More information in README.md. In
  particular, I highly recommend reading about how to use `local-tasks` to extend
  and / or override the default task-set.

  NB: gulpfile.js must be synchronous - no awaiting in here!
 */
const
  path = require("path"),
  {
    folderExistsSync,
    fileExistsSync,
    readTextFileSync,
    writeTextFileSync,
    lsSync, FsEntities
  } = require("yafs"),
  debug = require("debug")("zarro::gulpfile");

function tryFindGulpTasks(){
  const attempts = [
    path.join(__dirname, "gulp-tasks"),
    path.join(__dirname, "..", "..", "gulp-tasks")
  ];
  for (let attempt of attempts) {
    try {
      if (folderExistsSync(attempt)) {
        return attempt;
      }
    } catch (e) {
      // suppress
    }
  }
  throw new Error("Can't automagically find gulp-tasks folder; try defining GULP_TASKS_FOLDER env var");
}

const
  gulpTasksFolder = process.env.GULP_TASKS_FOLDER || tryFindGulpTasks(),
  requireModule = require(path.join(gulpTasksFolder, "modules", "require-module")),
  requireDir = require("require-dir");

debug(`using gulp tasks from ${ gulpTasksFolder }`);

if (!folderExistsSync(gulpTasksFolder)) {
  console.error("Either clone `gulp-tasks` to the `gulp-tasks` folder or modify this script to avoid sadness");
  process.exit(2);
}

let autoWorking = null;

function pauseWhilstWorking(){
  const
    args = process.argv,
    lastTwo = args.slice(args.length - 2),
    runningGulp = isGulpJs(lastTwo[ 0 ]),
    task = lastTwo[ 1 ];
  if (!runningGulp || !task) {
    return;
  }
  autoWorking = true;
  try {
    const localGulp = require("gulp");
    localGulp.task(task, function (){
      console.log(`--- taking over your ${ task } task whilst we do some bootstrapping ---`);
      return new Promise(function watchWorker(resolve, reject){
        if (!autoWorking) {
          return resolve();
        }
        setTimeout(function (){
          watchWorker(resolve, reject);
        }, 500);
      });
    });
  } catch (e) {
    /* suppress: may not have deps installed yet */
  }
}

function isGulpJs(filePath){
  return path.basename(filePath) === "gulp.js";
}

if (!process.env.RUNNING_AS_ZARRO) {
  if (!fileExistsSync("package.json")) {
    pauseWhilstWorking();
    console.log(
      "You need to set up a package.json first. I'll run `npm init` for you (:"
    );
    initializeNpm().then(() => autoWorking = false);
  } else if (mustInstallDeps()) {
    pauseWhilstWorking();
    console.log(
      "Now we just need to install the dependencies required for gulp-tasks to run (:"
    );
    installGulpTaskDependencies().then(() => {
      console.log("You're good to go with `gulp-tasks`. Try running `npm run gulp build`");
      autoWorking = false;
    });
  } else {
    bootstrapGulp();
  }
} else {
  bootstrapGulp();
}

function requiredDeps(){
  const starter = readJsonFile(path.join(gulpTasksFolder, "start", "_package.json"));
  return Object.keys(starter.devDependencies);
}

function readJsonFile(at){
  let data = "";
  try {
    data = readTextFileSync(at);
  } catch (e) {
    console.error(`Can't read file at ${ at }: ${ e }`);
    throw e;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Can't parse ${ at } as json: ${ e }`);
  }
}

function mustInstallDeps(){
  if (process.env.RUNNING_AS_ZARRO) {
    // deps should be properly handled by zarro package index and initial installation
    return false;
  }
  debug(`checking if should install deps; pwd: ${ process.cwd() }`);
  const pkg = loadPackageJson(),
    devDeps = pkg.devDependencies || {},
    haveDeps = Object.keys(devDeps),
    needDeps = requiredDeps(),
    missing = needDeps.filter(d => haveDeps.indexOf(d) === -1);
  const result = missing.length;
  if (result) {
    console.warn(`installing missing deps: ${ missing.join(",") }`);
  }
  return result;
}

function initializeNpm(){
  const os = require("os");
  const { system } = require("system-wrapper");
  return runNpmWith([ "init" ])
    .then(() => {
      if (os.platform() === "win32") {
        return system("cmd", [ "/c", "node", process.argv[ 1 ] ]);
      } else {
        return system("node", [ process.argv[ 1 ] ]);
      }
    });
}

function loadPackageJson(){
  debug(`attempting to load package.json in ${ process.cwd() }`);
  try {
    return readJsonFile("package.json");
  } catch (e) {
    console.error(`failed to load package.json: ${ e }`);
    throw e;
  }
}

function addMissingScript(pkg, name, script){
  pkg.scripts[ name ] = pkg.scripts[ name ] || script;
}

function installGulpTaskDependencies(){
  debug(`install gulp task deps, cwd: ${ process.cwd() }`);
  const
    findFirstDirThatExists = (...args) => {
      return args.reduce(
        (acc, cur) =>
          acc || (folderExistsSync(cur) ? acc : cur),
        undefined
      );
    },
    deps = requiredDeps(),
    pkg = loadPackageJson(),
    buildTools = findFirstDirThatExists("tools", "build-tools", ".tools", ".build-tools"),
    prepend = `cross-env BUILD_TOOLS_FOLDER=${ buildTools }`;

  addMissingScript(pkg, "gulp", `${ prepend } gulp`);
  addMissingScript(pkg, "test", "run-s \"gulp test-dotnet\"");

  writeTextFileSync("package.json", JSON.stringify(pkg, null, 2));
  return runNpmWith([ "install", "--save-dev" ].concat(deps));
}

function requireDirIfFound(dir){
  const fullPath = path.join(process.cwd(), dir);
  if (folderExistsSync(fullPath)) {
    requireDir(fullPath);
  }
}

function importExternalTasks(){
  const externalTaskFolders = lsSync(
    "external-tasks",
    {
      recurse: false,
      entities: FsEntities.folders,
      fullPaths: true
    }
  );
  for (const folder of externalTaskFolders) {
    requireDir(folder);
  }
}

function bootstrapGulp(){
  const { importNpmTasks } = requireModule("import-npm-tasks");
  try {
    importNpmTasks();
    const
      requireDir = require("require-dir");
    requireDir(gulpTasksFolder);
    requireDirIfFound("local-tasks");
    requireDirIfFound("override-tasks");
    importExternalTasks();
  } catch (e) {
    if (shouldDump(e)) {
      console.error(e);
    } else {
      if (!process.env.DEBUG) {
        console.log(
          "Error occurred. For more info, set the DEBUG environment variable (eg set DEBUG=*)."
        );
      }
    }
    process.exit(1);
  }

  function shouldDump(e){
    return isZarroError(e) ||
      e.shouldAlwaysSurface ||
      process.env.ALWAYS_DUMP_GULP_ERRORS ||
      process.env.DEBUG === "*" ||
      probablyNotReportedByGulp(e);
  }

  function isZarroError(e){
    return e && e.constructor.name === "ZarroError";
  }

  function probablyNotReportedByGulp(e){
    const
      message = (e || "").toString().toLowerCase();
    return [ "cannot find module", "referenceerror", "syntaxerror" ].reduce(
      (acc, cur) => {
        return acc || message.indexOf(cur) > -1;
      },
      false
    );
  }
}

function runNpmWith(args){
  const { system } = require("system-wrapper");
  const os = require("os");
  return os.platform() === "win32"
    ? system("cmd", [ "/c", "npm" ].concat(args), {
      interactive: true
    })
    : system("npm", args, {
      interactive: true
    });
}
