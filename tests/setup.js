global.requireModule = require("../gulp-tasks/modules/require-module");
jest.retryTimes(3, { logErrorsBeforeRetry: true });
const log = requireModule("log");
log.disableOutput();
process.env.RUNNING_IN_TEST = "TRUE";
// jest spies broke at some point after v26
// -> call through to the underlying implementation (wtf)
// -> @types/jest doesn't align with what's actually available
// hence this monkeypatch to restore the prior behavior
global.spyOn = function (obj, member) {
  const original = obj[member];
  const result = jest.spyOn(obj, member);
  result.mockImplementation(() => {
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
    },
    stub() {
      result.mockImplementation(() => {
      });
    }
  };
  Object.defineProperty(result, "and", {
    get() {
      return and;
    }
  });

  function mkCallInfo(
    args,
    obj,
    returnValue
  ) {
    return {
      object: obj,
      args: args,
      returnValue: returnValue
    };
  }

  function findMockValue(spy, index) {
    const call = spy.mock.results[index];
    return call
      ? call.value
      : undefined;
  }

  Object.defineProperty(result, "calls", {
    get() {
      return {
        mostRecent() {
          return mkCallInfo(
            result.mock.lastCall,
            obj,
            findMockValue(result, result.mock.calls.length - 1)
          );
        },
        argsFor(index) {
          return result.mock.calls[index];
        },
        any() {
          return (result.mock.calls || []).length > 0;
        },
        all() {
          return (result.mock.calls || [])
            .map((args, i) => mkCallInfo(args, obj, findMockValue(result, i)));
        },
        count() {
          return (result.mock.calls || []).length;
        },
        reset() {
          result.mockClear();
        },
        first() {
          return mkCallInfo(
            result.mock.calls[0],
            obj,
            findMockValue(result, 0)
          );
        }
      };
    }
  });
  return result;
};
