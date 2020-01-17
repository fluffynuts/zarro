module.exports = function containsAny() {
  const
    args = Array.from(arguments),
    array = args[0] || [];
  if (array.length === 0) {
    return false;
  }

  const values = args.slice(1);
  if (values.length === 0) {
    return true;
  }

  return (array).reduce(
    (acc, cur) => {
      if (acc) {
        return acc;
      }
      if (cur === values[0]) {
        return true;
      }
      return containsAny(values.slice(1), cur);
    },
    false);
};
