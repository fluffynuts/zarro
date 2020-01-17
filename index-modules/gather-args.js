const
  fs = require("fs"),
  path = require("path"),
  readTextFile = require("./read-text-file");
module.exports = function gatherArgs(indexFilePath) {
  const
    indexContents = readTextFile(indexFilePath),
    indexSize = fs.statSync(indexFilePath).size,
    indexFileName = path.basename(indexFilePath);
  let foundSelf = false;
  return process.argv.reduce((acc, cur) => {
    if (foundSelf) {
      acc.push(cur);
    }
    if (!fs.existsSync(cur)) {
      return acc;
    }
    const curFileName = path.basename(cur);
    if (curFileName !== indexFileName) {
      return acc;
    }

    try {
      // test file size
      const stat = fs.statSync(cur);
      if (stat.size !== indexSize) {
        return acc;
      }
      // test file contents
      const curContents = readTextFile(cur);
      // ensure that the arg refers to the starting file
      foundSelf = curContents === indexContents;
    } catch {
      /* ignore */
    }
    return acc;
  }, []);
};
