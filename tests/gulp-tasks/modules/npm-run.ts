(function() {
  const
    os = require("os"),
    spawn = requireModule<Spawn>("spawn");

  type StringOrArrayOfStrings = string | string[];

  function flatten(a: StringOrArrayOfStrings[]) {
    // essentially Array.flat, but I'm not assuming that's
    // available
    return a.reduce(
      (acc: string[], cur: StringOrArrayOfStrings) => {
        if (Array.isArray(cur)) {
          return acc.concat(cur);
        } else {
          acc.push(cur);
          return acc;
        }
      }, [] as string[]);
  }

  async function npmRun(...args: StringOrArrayOfStrings[]): Promise<void> {
    const flattened = flatten(args);
    if (os.platform() === "win32") {
      await spawn("cmd", [ "/c", "npm" ].concat(flattened), {
        interactive: true
      })
    } else {
      await spawn("npm", flattened);
    }
  }

  async function foo() {
    await npmRun("foo", "bar");
    await npmRun([ "foo", "bar"]);
  }

  module.exports = {
    npmRun
  };
})();
