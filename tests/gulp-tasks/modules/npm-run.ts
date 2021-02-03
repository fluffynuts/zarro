(function() {
  const
    os = require("os"),
    spawn = requireModule<Spawn>("spawn");

  async function npmRun(args: string[]): Promise<void> {
    if (os.platform() === "win32") {
      await spawn("cmd", [ "/c", "npm" ].concat(args))
    } else {
      await spawn("npm", args);
    }
  }

  module.exports = {
    npmRun
  };
})();
