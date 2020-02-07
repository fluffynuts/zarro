const
  stat = require("./stat"),
  path = require("path"),
  readTextFile = require("./read-text-file");

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
  } catch {
    /* ignore */
  }
}

module.exports = async function gatherArgs(
  indexFilePath,
  overrideArgv // for testing only
) {
  const
    indexContents = await readTextFile(indexFilePath),
    indexSize = (await stat(indexFilePath)).size,
    argv = overrideArgv || process.argv,
    acc = [];
  let foundSelf = false;

  for (let arg of argv) {
    if (foundSelf) {
      acc.push(arg);
    } else {
      foundSelf = await isProbablySameFile(
        arg,
        indexFilePath,
        indexSize,
        indexContents
      );
    }
  }
  return acc;
};
