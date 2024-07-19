"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldSkipSlowNetworkTests = void 0;
const { toBool } = require("../../gulp-tasks/modules/env");
function shouldSkipSlowNetworkTests() {
    if (!process.env.SKIP_SLOW_NETWORK_TESTS) {
        return false;
    }
    return toBool("SKIP_SLOW_NETWORK_TESTS", process.env.SKIP_SLOW_NETWORK_TESTS, "0");
}
exports.shouldSkipSlowNetworkTests = shouldSkipSlowNetworkTests;
