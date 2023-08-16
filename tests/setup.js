global["require" + "Module"] = require("../gulp-tasks/modules/require-module");
// jest spies broke at some point after v26
// -> call through to the underlying implementation (wtf)
// -> @types/jest doesn't align with what's actually available
// hence this monkeypatch to restore the prior behavior
global.spyOn = function (obj, member) {
  const original = obj[member];
  const result = jest.spyOn(obj, member).mockImplementation(() => {
  });
  if (!!result.and) {
    return result;
  }
  const and = {
    callFake(fn) {
      result.mockImplementation(fn);
    },
    returnValue(v) {
      result.mockReturnValue(v);
    },
    callThrough() {
      original.apply(obj, Array.from(arguments));
    }
  };
  Object.defineProperty(result, "and", {
    get() {
      return and;
    }
  });
  return result;
};
