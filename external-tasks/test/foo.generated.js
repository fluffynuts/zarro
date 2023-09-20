(function () {
    const gulp = requireModule("gulp");
    gulp.task("external", async () => {
        const sleep = requireModule("sleep");
        console.log("external task starts");
        await sleep(1000);
        console.log("external task done");
    });
})();
