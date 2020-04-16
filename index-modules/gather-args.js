const
  stat = require("../gulp-tasks/modules/stat"),
  path = require("path"),
  readTextFile = require("../gulp-tasks/modules/read-text-file");

async function isProbablySameFile(
  test,
  compare,
  compareSize,
  compareContents) {
  const fileInfo = await stat(test);
  if (fileInfo === null) {
    return;
  }

  const
    base1 = path.basename(test),
    base2 = path.basename(compare);
  if (base1 !== base2) {
    return false;
  }

  try {
    // test file size
    if (fileInfo.size !== compareSize) {
      return false;
    }
    // test file contents
    const testContents = await readTextFile(test);
    // ensure that the arg refers to the starting file
    return testContents === compareContents;
  } catch (e) {
    /* ignore */
  }
}

module.exports = async function gatherArgs(
  potentialEntryPoints,
  overrideArgv // for testing only
) {
  if (!Array.isArray(potentialEntryPoints)) {
    potentialEntryPoints = [ potentialEntryPoints ];
  }
  for (let entryPoint of potentialEntryPoints) {
    let st;
    try {
      st = await stat(entryPoint);
    } catch (e) {
      // not found; try next
      continue;
    }
    if (!st) {
      // not found; try next
      continue;
    }
    const
      indexContents = await readTextFile(entryPoint),
      indexSize = st.size,
      argv = overrideArgv || process.argv,
      acc = [];
    let foundSelf = false;

    for (let arg of argv) {
      if (foundSelf) {
        acc.push(arg);
      } else {
        foundSelf = await isProbablySameFile(
          arg,
          entryPoint,
          indexSize,
          indexContents
        );
      }
    }
    if (foundSelf) {
      return acc;
    }
  }
  throw new Error("Can't figure out args: unable to find entry point in args list");
};
