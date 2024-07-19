const { toBool} = require("../../gulp-tasks/modules/env");

export function shouldSkipSlowNetworkTests() {
  if (!process.env.SKIP_SLOW_NETWORK_TESTS) {
    return false;
  }
  return toBool(
    "SKIP_SLOW_NETWORK_TESTS",
    process.env.SKIP_SLOW_NETWORK_TESTS,
    "0"
  );
}
