import "../interfaces";
const gulp = requireModule<GulpWithHelp>("gulp-with-help");

gulp.task("release", [ "increment-package-json-version" ], () => {
  console.log("run release");
  return Promise.resolve();
});
