global["require" + "Module"] = require("../gulp-tasks/modules/require-module");

beforeAll(() => {
  require("expect-more-jest");
  require("./helpers/matchers");
});
