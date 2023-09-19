(function () {
  const
    packageLookup = {
      [`local`]: undefined,
      [`beta`]: "zarro@beta",
      [`latest`]: "zarro@latest"
    } as Dictionary<Optional<string>>;

  async function testZarro(opts: TestZarroOptions): Promise<void> {
    const
      log = requireModule<Log>("log"),
      system = requireModule<System>("system");
    if (!opts) {
      throw new Error(`no options provided`);
    }
    const tasks = opts.tasks;
    if (!tasks) {
      throw new Error(`'tasks' not defined on options`);
    }

    const taskArray = Array.isArray(tasks)
      ? tasks
      : [ tasks ];

    const toInstall = packageLookup[opts.packageVersion];
    if (toInstall) {
      await system(
        "npm",
        [ "install", "--no-save", toInstall ]
      );
    }

    try {
      for (const task of taskArray) {
        await system(
          "npm",
          [ "run", task ]
        );
      }
    } catch (e) {
      log.error(`test run fails:\n${ e }`);
    } finally {
      if (opts.rollback) {
        await system("git", [ "reset", "--hard" ]);
      }
    }
  }
  module.exports = testZarro;
})();
