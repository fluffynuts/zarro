function assert(expr, failMessage) {
  if (!expr) {
    if (typeof failMessage === "function") {
      failMessage = failMessage();
    }
    throw new Error(failMessage);
  }
}

function runAssertions(ctx, func) {
  try {
    const message = func() || "";
    return {
      message: typeof message === "function" ? message : () => message,
      pass: true
    };
  } catch (e) {
    return {
      pass: false,
      message: () => e.message || e
    };
  }
}

beforeAll(() => {
  expect.extend({
    toExist: function(actual) {
      return runAssertions(this, () => {
        assert(actual, `expected ${actual} to exist`);
      });
    }
  });
});
