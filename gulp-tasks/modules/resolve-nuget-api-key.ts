(function () {
  const
    env = requireModule<Env>("env"),
    log = requireModule<Log>("log"),
    { listNugetSources } = requireModule<DotNetCli>("dotnet-cli");

  async function resolveNugetApiKey(
    source?: string
  ): Promise<Optional<string>> {
    const
      allKeys = resolveSourceToKeyLookup(),
      requestedSource = await resolveSourceName(resolveSource(source));
    if (!requestedSource) {
      return findValue(allKeys, "nuget.org") || findValue(allKeys, "*");
    }
    const
      perSource = findValue(allKeys, requestedSource),
      multiKeyFallback = findValue(allKeys, "*"),
      nugetOrgFallback = findValue(allKeys, "nuget.org"),
      ultimateFallback = env.resolve(env.NUGET_API_KEY);
    return perSource || multiKeyFallback || nugetOrgFallback || ultimateFallback || undefined;
  }

  function resolveSourceToKeyLookup(): Dictionary<string> {
    const
      defaultKey = env.resolve(env.NUGET_API_KEY),
      blob = env.resolve(env.NUGET_API_KEYS);
    if (!blob) {
      const defaultSource = resolveSource();
      if (!defaultKey) {
        return {};
      }
      const result = generateDefaultKeyContainer(defaultKey);
      return defaultSource
        ? {
          ...result,
          [defaultSource]: defaultKey
        }
        : result;
    }
    if (!!blob.match(/{+.*:+/)) {
      return {
        ...generateDefaultKeyContainer(defaultKey),
        ...JSON.parse(blob)
      };
    } else {
      return generateDefaultKeyContainer(blob);
    }
  }

  function generateDefaultKeyContainer(k: string) {
    return {
      ["*"]: k
    };
  }

  function findValue(
    keys: Optional<Dictionary<string>>,
    seek: string
  ): Optional<string> {
    if (!keys || !seek) {
      return undefined;
    }
    const exactMatch = keys[seek];
    if (exactMatch) {
      return exactMatch;
    }

    return fuzzyFindValue(keys, seek);
  }

  function fuzzyFindValue(
    keys: Dictionary<string>,
    seek: string
  ): Optional<string> {
    const keyLookup = Object.keys(keys)
      .reduce(
        (acc: Dictionary<string>, cur: string) => {
          acc[cur.toLowerCase()] = cur;
          return acc;
        }, {} as Dictionary<string>
      );
    const key = keyLookup[seek.toLowerCase()];
    return keys[key];
  }

  async function resolveSourceName(
    sourceToResolve: string
  ): Promise<string> {
    const
      sources = await listNugetSources();

    for (const source of sources) {
      if (source.name.toLowerCase() === sourceToResolve.toLowerCase()) {
        return source.name;
      }
      if (source.url.toLowerCase() === sourceToResolve.toLowerCase()) {
        return source.name;
      }
    }

    log.warn(`Unable to match provides nuget push source '${ sourceToResolve }' to the url or name of any registered source on this machine`);
    log.warn(`  known sources are:`)
    for (const source of sources) {
      log.warn(`    ${ source.name }: ${ source.url } (${ source.enabled ? "enabled" : "disabled" })`);
    }

    throw new Error(`Unable to determine the nuget source to push to`);

  }

  function resolveSource(source?: string): string {
    if (source) {
      return source;
    }
    return env.resolve(env.NUGET_PUSH_SOURCE)
           || env.resolve(env.NUGET_SOURCE)
           || (env.resolveArray(env.NUGET_SOURCES) || [])[0]
  }

  module.exports = resolveNugetApiKey;
})();
