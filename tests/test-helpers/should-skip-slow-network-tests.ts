const { toBool} = require("../../gulp-tasks/modules/env");

export function shouldSkipSlowNetworkTests() {
  return toBool(
    process.env.SKIP_SLOW_NETWORK_TESTS || ""
  );
}
