(function () {
  const
    env = requireModule<Env>("env"),
    gutil = requireModule<GulpUtil>("gulp-util"),
    debug = requireModule<DebugFactory>("debug")(__filename),
    editXml = require("gulp-edit-xml"),
    incrementVersion = requireModule<IncrementVersion>("increment-version"),
    ZarroError = requireModule<ZarroError>("zarro-error"),
    xmlOpts = {
      builderOptions: {
        renderOpts: {
          pretty: true
        }
      }
    };

  // FIXME: proper types plz
  function incrementPackageVersionInCsProj(xml: any, file: any) {
    debug(JSON.stringify(xml, null, 2));
    const packageVersionPropGroup = xml.Project.PropertyGroup.filter(
      (g: any) => !!g.PackageVersion
    )[0];
    if (!packageVersionPropGroup) {
      // if we got in here, then something wants to increment
      // the package version, but we can't unless the correct
      // structure is found in the project
      throw new ZarroError(
        `Unable to increment package version in '${ file.path }': no PropertyGroup containing a PackageVersion node was found.`
      );
    }
    const node = packageVersionPropGroup.PackageVersion;
    const newVersion = incrementVersion(
      node[0],
      env.resolveFlag("BETA")
        ? env.resolveWithFallback(env.VERSION_INCREMENT_STRATEGY, "prerelease")
        : env.resolve(env.VERSION_INCREMENT_STRATEGY),
      env.resolveFlag(env.VERSION_INCREMENT_ZERO),
      env.resolveNumber(env.PACK_INCREMENT_VERSION_BY)
    );
    node[0] = newVersion;

    const incrementProjectVersion = env.resolveFlag(env.PACK_SYNC_PROJECT_VERSION);
    if (incrementProjectVersion) {
      const projectVersionPropGroup = xml.Project.PropertyGroup.filter(
        (g: any) => !!g.Version
      );
      if (!projectVersionPropGroup) {
        throw new ZarroError(`${env.PACK_SYNC_PROJECT_VERSION} was set, but no PropertyGroup with a Version child was found.`)
      }
      projectVersionPropGroup[0].Version = [ newVersion ];
    }

    let packageIdPropGroup = xml.Project.PropertyGroup.filter(
      (g: any) => !!g.PackageId
    )[0];
    let packageName = "(unknown)";
    if (!packageIdPropGroup) {
      if (!file) {
        throw new ZarroError([
          `the installed version of gulp-edit-xml does not pass in the file being operated on.`,
          `either:`,
          `- update to the latest version`,
          `  or`,
          `- set the version to use "https://github.com/fluffynuts/gulp-edit-xml.git#pass-file-to-transform"`,
          ` (if the update doesn't make this message go away)`
        ].join("\n"));
      }
      const filePath = file.history[0];
      packageIdPropGroup = xml.Project.PropertyGroup.filter(
        (g: any) => !!g.AssemblyName
      )[0];
      if (!packageIdPropGroup) {
        debug({
          file: JSON.stringify(file),
          fileName: file.name,
          stat: file.stat,
          string: file.toString(),
          hist: filePath
        });

        if (filePath) {
          const parts = filePath.split(/[\\/]/);
          debug({
            parts
          });
          packageName = parts[parts.length - 2] || packageName;
        }
      } else {
        packageName = (packageIdPropGroup.AssemblyName[0] || packageName).trim();
      }
    } else {
      packageName = (packageIdPropGroup.PackageId[0] || packageName).trim();
    }

    gutil.log(
      gutil.colors.yellow(
        `${ packageName }: package version incremented to: ${ newVersion }`
      )
    );

    debug({
      label: "final xml",
      doc: JSON.stringify(xml, null, 2)
    });

    return xml;
  }

  async function incrementPackageVersionInNuspec(xml: any) {
    const meta = xml.package.metadata[0],
      packageName = meta.id[0],
      node = meta.version,
      current = node[0];
    const newVersion = incrementVersion(
      current,
      env.resolveFlag("BETA")
        ? "prerelease"
        : env.resolve("VERSION_INCREMENT_STRATEGY"),
      env.resolveFlag("VERSION_INCREMENT_ZERO"),
      env.resolveNumber("PACK_INCREMENT_VERSION_BY")
    );

    node[0] = newVersion;
    gutil.log(
      gutil.colors.yellow(
        `${ packageName }: package version incremented to: ${ newVersion }`
      )
    );
    return xml;
  }

  function incrementPackageVersion() {
    return editXml(
      (xml: any, file: any) => {
        if (xml.package) {
          return incrementPackageVersionInNuspec(xml);
        } else if (xml.Project) {
          return incrementPackageVersionInCsProj(xml, file);
        }
        throw new ZarroError(
          `Don't know how to increment package version in document:\n\n${ JSON.stringify(
            xml
          ) }`
        );
      },
      xmlOpts
    );
  }

  module.exports = {
    incrementPackageVersion
  };

})();
