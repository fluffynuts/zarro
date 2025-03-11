(function() {
  const ZarroError = requireModule<ZarroError>("zarro-error");
  const { parseBool } = requireModule<ParseBool>("parse-bool");

  function env(name: string, fallback?: string): string {
    const value = process.env[name];
    if (value !== undefined) {
      return value;
    }
    const argCount = Array.from(arguments).length;
    if (argCount > 1) {
      return fallback as string;
    }
    throw new ZarroError(
      `environment variable '${ name }' is not defined and no fallback provided`
    );
  }

  function envNumber(name: string, fallback?: number): number {
    const
      haveFallback = fallback !== undefined,
      value = haveFallback ? env(name, fallback?.toString()) : env(name),
      parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
    throw new ZarroError(
      `environment variable '${ name }' is invalid: expected numeric value but found '${ value }'`
    );
  }

  function envFlag(name: string, fallback?: boolean): boolean {
    const
      haveFallback = fallback !== undefined,
      value = haveFallback ? env(name, fallback?.toString()) : env(name);
    return parseBoolEnvVar(name, value);
  }

  function parseBoolEnvVar(name: string, value: string): boolean {
    try {
      return parseBool(value, true);
    } catch (e) {
      throw new ZarroError(
        `environment variable '${name}' is invalid: could not parse '${value}' as a boolean value`
      );
    }
  }

  module.exports = {
    env,
    envNumber,
    envFlag
  }

})();
