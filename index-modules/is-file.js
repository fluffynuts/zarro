const stat = require("./stat");

module.exports = async function(path) {
  const st = await stat(path);
  return st != null;
};
