(function () {
  const
    env = requireModule<Env>("env"),
    resolveMasks = requireModule<ResolveMasks>("resolve-masks");

  module.exports = function resolveTestMasks(
    isDotnetCore?: boolean
  ) {
    if (isDotnetCore === undefined) {
      isDotnetCore = env.resolveFlag("DOTNET_CORE");
    }
    return resolveMasks(
      [ env.TEST_INCLUDE, env.TEST_ADDITIONAL_INCLUDE ],
      [ env.TEST_EXCLUDE, env.TEST_ADDITIONAL_EXCLUDE ],
      p => {
        if (p.match(/\*\*$/)) {
          p += "/*";
        }
        return isDotnetCore
          ? `${ p }.csproj`
          : `${ p }.dll`
      }
    );
  };
})();
