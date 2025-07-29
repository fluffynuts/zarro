import * as dotnetCli from "dotnet-cli";

(function () {
  const { streamify } = requireModule<Streamify>("streamify");
  const ZarroError = requireModule<ZarroError>("zarro-error");
  const { log, colors } = requireModule<GulpUtil>("gulp-util");
  const { yellowBright, cyanBright } = colors;
  const env = requireModule<Env>("env");

  function wrap<T>(fn: (opts: T) => Promise<SystemResult | void>): AsyncTVoid<T> | AsyncVoidVoid {
    return async (opts: T) => {
      const result = await fn(opts);
      if (result instanceof Error) {
        throw result;
      }
      // otherwise, discard the result
    };
  }

  function build(opts: DotNetBuildOptions) {
    return streamify(
      wrap(dotnetCli.build),
      f => {
        const copy = { ...opts };
        copy.target = f.path;
        return copy;
      },
      "gulp-dotnet-cli-build",
      "building project or solution"
    );
  }

  function clean(opts: DotNetCleanOptions) {
    return streamify(
      wrap(dotnetCli.clean),
      f => {
        const copy = { ...opts };
        copy.target = f.path;
        return copy;
      },
      "gulp-dotnet-cli-clean",
      "cleaning project or solution"
    )
  }

  function test(opts: DotNetPackOptions) {
    return streamify(
      wrap(dotnetCli.test),
      f => {
        const copy = { ...opts };
        copy.target = f.path;
        return copy;
      },
      "gulp-dotnet-cli-pack",
      "creating nuget package"
    );
  }

  function pack(opts: DotNetPackOptions) {
    return streamify(
      wrap(dotnetCli.pack),
      async f => {
        const copy = { ...opts };
        copy.target = f.path;
        return copy;
      },
      "gulp-dotnet-cli-pack",
      "creating nuget package"
    );
  }

  function nugetPush(opts: DotNetNugetPushOptions) {
    return streamify(
      wrap(dotnetCli.nugetPush),
      f => {
        const copy = { ...opts };
        copy.target = f.path;
        return copy
      },
      "gulp-dotnet-cli-nuget-push",
      "pushing nuget package"
    )
  }

  function publish(
    opts: DotNetPublishOptions
  ) {
    return streamify(
      wrap(dotnetCli.publish),
      async f => {
        const copy = { ...opts };
        copy.target = f.path;
        if (copy.publishContainer) {
          const
            containerOpts = await dotnetCli.resolveContainerOptions(copy),
            nameOpt = definitelyFind(containerOpts, "containerImageName"),
            tagOpt = definitelyFind(containerOpts, "containerImageTag"),
            registryOpt = definitelyFind(containerOpts, "containerRegistry");
          logResolvedOption("Publish container", nameOpt);
          logResolvedOption("         with tag", tagOpt);
          logResolvedOption("      to registry", registryOpt);
        }
        return copy;
      },
      "gulp-dotnet-cli-publish",
      "publishing dotnet project"
    )
  }

  const envVarLookup: Dictionary<string> = {
    "containerImageName": env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
    "containerImageTag": env.DOTNET_PUBLISH_CONTAINER_IMAGE_TAG,
    "containerRegistry": env.DOTNET_PUBLISH_CONTAINER_REGISTRY
  };

  function logResolvedOption(
    label: string,
    opt: ResolvedContainerOption
  ) {
    log(`${yellowBright(label)}: ${cyanBright(opt.value)} (override with: ${opt.environmentVariable})`);
  }

  function definitelyFind(
    collection: dotnetCli.ResolvedContainerOption[],
    key: string
  ): ResolvedContainerOption {
    const found = collection.find(o => o.option === key);
    if (found) {
      const result = found as ResolvedContainerOption;
      result.environmentVariable = envVarLookup[key];
    }
    throw new ZarroError(`Unable to find item with key: (${key})`);
  }

  module.exports = {
    build,
    clean,
    test,
    pack,
    nugetPush,
    publish
  } as GulpDotNetCli;
})();
