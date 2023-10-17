(function () {
  const
    taskName = "clear-packages-folder",
    gulp = requireModule<Gulp>("gulp"),
    env = requireModule<Env>("env");

  env.associate([
    env.PACK_TARGET_FOLDER
  ], taskName);

  gulp.task("clear-packages-folder", async () => {
    const
      {
        rm,
        mkdir
      } = require("yafs"),
      packagesDir = env.resolve(env.PACK_TARGET_FOLDER);

    await rm(packagesDir);
    await mkdir(packagesDir);
  });
})();
