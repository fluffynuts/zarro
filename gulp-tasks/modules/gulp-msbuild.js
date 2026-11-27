// gulp-msbuild is only needed for msbuild builds; loading it lazily keeps its
// dependency resolution (see package.json) from affecting anyone who doesn't use it.
module.exports = function (...args) {
  return require("gulp-msbuild")(...args);
};
