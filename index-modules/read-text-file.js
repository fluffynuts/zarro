const fs = require("fs");

module.exports = function readTextFile(path) {
  return fs.readFileSync(path, { encoding: "utf8" }).toString();
};
