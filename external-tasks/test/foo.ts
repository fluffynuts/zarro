(function () {
  const
    gulp = requireModule<Gulp>("gulp");

  gulp.task("external", async () => {
    const
      sleep = requireModule<Sleep>("sleep");
    console.log("external task starts");
    await sleep(1000);
    console.log("external task done");
  });
})();
