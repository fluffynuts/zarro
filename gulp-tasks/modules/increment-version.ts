(function () {
  const
    env = requireModule<Env>("env"),
    ZarroError = requireModule<ZarroError>("zarro-error"),
    generateVersionSuffix = requireModule<GenerateVersionSuffix>("generate-version-suffix");

  function zeroFrom(parts: number[], startIndex: number) {
    for (let i = startIndex; i < parts.length; i++) {
      parts[i] = 0;
    }
  }

  function incrementAt(
    parts: number[],
    index: number,
    incrementBy: number
  ) {
    if (parts[index] === undefined) {
      throw new ZarroError(`version '${ parts.join(".") }' has no value at position ${ index }`);
    }
    parts[index] += incrementBy;
  }

  const incrementLookup: { [key: string]: number } = {
    "prerelease": -1,
    "major": 0,
    "minor": 1,
    "patch": 2
  };

  module.exports = function incrementVersion(
    version: string,
    strategy: VersionIncrementStrategy,
    zeroLowerOrder: boolean = true,
    incrementBy: number = 1
  ): string {
    const
      dashedParts = version.split("-"),
      currentVersionIsPreRelease = dashedParts.length > 1,
      prefix = removePrefix(dashedParts),
      parts = dashedParts[0].split(".").map(i => parseInt(i));
    let toIncrement = incrementLookup[(strategy || "").toLowerCase()]
    if (toIncrement === undefined) {
      throw new ZarroError(`Unknown version increment strategy: ${ strategy }\n try one of 'major', 'minor' or 'patch'`);
    }
    if (strategy != "prerelease") {
      const shouldNotActuallyIncrement = strategy === "patch" &&
                                         dashedParts.length > 1;
      if (!shouldNotActuallyIncrement) {
        incrementAt(parts, toIncrement, incrementBy);
      }
      if (zeroLowerOrder) {
        zeroFrom(parts, toIncrement + 1);
      }
    } else {
      const shouldIncrementMinorForPreRelease = env.resolveFlag(
        env.PACK_INCREMENT_MINOR_ON_FIRST_PRERELEASE
      ) && !currentVersionIsPreRelease;

      // bump the minor if this is the first pre-release
      if (shouldIncrementMinorForPreRelease) {
        incrementAt(parts, 2, 1);
      }
    }
    const result = parts.join(".");
    if (strategy != "prerelease") {
      return `${ prefix }${ result }`;
    }
    return `${ prefix }${ result }-${ generateVersionSuffix() }`;
  }

  function removePrefix(parts: string[]) {
    const
      match = parts[0].match(/^(?<prefix>[^.\d]+)?(?<version>[.\d]+)/),
      prefix = match?.groups?.["prefix"] ?? "",
      version = match?.groups?.["version"];

    if (!version) {
      throw new Error(`'${ parts[0] }' doesn't look like a version string?`)
    }
    parts[0] = version;
    return prefix;
  }

})()
