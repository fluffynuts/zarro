(function() {
  const { fileExistsSync } = require("yafs");
  module.exports = function isFile(path: string) {
    return fileExistsSync(path);
  }
})();
