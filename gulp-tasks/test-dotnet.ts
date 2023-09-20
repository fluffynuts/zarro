(function () {
  const
    gulp = requireModule<Gulp>("gulp"),
    env = requireModule<Env>("env"),
    { runTests } = requireModule<TestDotNetLogic>("test-dotnet-logic");
  gulp.task(
    "test-dotnet",
    `Runs all tests in your solution via nunit-cli or dotnet test`,
    [ "build" ],
    runTests
  );

  gulp.task(
    "quick-test-dotnet",
    `Tests whatever test assemblies have been recently built *`,
    runTests
  );

  const myTasks = [ "test-dotnet", "quick-test-dotnet" ],
    myVars = [
      env.BUILD_CONFIGURATION,
      env.DOTNET_CORE,
      env.TEST_INCLUDE,
      env.TEST_ADDITIONAL_INCLUDE,
      env.TEST_EXCLUDE,
      env.TEST_ADDITIONAL_EXCLUDE,
      env.MAX_NUNIT_AGENTS,
      env.MAX_CONCURRENCY,
      env.BUILD_REPORT_XML,
      env.NUNIT_ARCHITECTURE,
      env.NUNIT_LABELS,
      env.TEST_VERBOSITY,
      env.DOTNET_TEST_PARALLEL,
      env.DOTNET_PARALLEL_STAGGER_MS,
      env.RETAIN_TEST_DIAGNOSTICS
    ];
  env.associate(myVars, myTasks);

})();
