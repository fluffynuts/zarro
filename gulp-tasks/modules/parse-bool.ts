const truthy = [
    "1",
    "yes",
    "true"
  ],
  falsey = [
    "0",
    "no",
    "false"
  ];

export function parseBool(
  value: string,
  strict?: boolean
): boolean {
  if (truthy.indexOf(value?.toString()) > -1) {
    return true;
  }
  if (falsey.indexOf(value?.toString()) > -1) {
    return false;
  }
  if (strict) {
    throw new Error(
      `could not parse '${value}' as a boolean value`
    );
  }
  return !!value;
}
