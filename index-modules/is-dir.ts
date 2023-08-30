(function() {
const { folderExistsSync } = require("yafs");

module.exports = async function isDir(
    path: string
) {
  return folderExistsSync(path);
};
})();
