(function() {

  const positives = new Set([
    "yes",
    "y",
    "1",
    "true",
    "on"
  ]);

  const negatives = new Set([
    "no",
    "n",
    "0",
    "false",
    "off"
  ]);

  function parseFlag(
    value: string,
    fallback?: boolean
  ): boolean {
    const lower = (value || "").toLowerCase();
    if (positives.has(lower)) {
      return true;
    }
    if (negatives.has(lower)) {
      return false;
    }
    if (fallback !== undefined) {
      return fallback;
    }

    const possiblePositives = [];
    for (const item of positives) {
      possiblePositives.push(item);
    }

    const possibleNegatives = [];
    for (const item of negatives) {
      possibleNegatives.push(item);
    }

    throw new Error(
`${value} is not a valid flag value.
Try one of:
  - accepted truthy values:
    ${possiblePositives.join(", ")}
  - accepted falsey values:
    ${possibleNegatives.join(", ")}
`
    );
  }

  module.exports = {
    parseFlag
  };
})();
