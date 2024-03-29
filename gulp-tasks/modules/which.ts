(function() {
  const _which_ = require("which");
  const cache = {} as Dictionary<string>;

  module.exports = function which(
    executable: string
  ): Optional<string> {
    if (cache[executable]) {
      return cache[executable];
    }
    try {
      return cache[executable] = _which_.sync(executable);
    } catch (e) {
      return undefined;
    }
  }
})();
