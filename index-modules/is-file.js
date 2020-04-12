const stat = require("../gulp-tasks/modules/stat");

module.exports = async function(path) {
  const st = await stat(path);
  return st && st.isFile();
};
