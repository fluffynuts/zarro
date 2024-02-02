import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";

describe(`resolve-nuget-pus-package-files`, () => {
  const
    env = requireModule<Env>("env"),
    { resolveNugetPushPackageFiles } = requireModule<ResolveNugetPushPackageFiles>("resolve-nuget-push-package-files"),
    sut = resolveNugetPushPackageFiles;

  describe(`default behavior`, () => {
    const existingEnvironment = {
      [env.PACK_TARGET_FOLDER]: process.env[env.PACK_TARGET_FOLDER],
      [env.NUGET_PUSH_PACKAGES]: process.env[env.NUGET_PUSH_PACKAGES]
    } as Dictionary<string>;
    beforeEach(() => {

    });
    afterEach(async () => {
      // some tests may modify env vars, so we need to reset
      for (const key of Object.keys(existingEnvironment)) {
        if (existingEnvironment[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = existingEnvironment[key];
        }
      }
    });

    it(`should return all packages under the packages folder`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        packFolder = env.resolve(env.PACK_TARGET_FOLDER),
        package1 = "foo.bar.nupkg",
        package1Symbols = "foo.bar.symbols.nupkg",
        package2 = "quux.cow.nupkg",
        notAPackage = "README.md";

      const toCreate = [
        `${ packFolder }/${ package1 }`,
        `${ packFolder }/${ package1Symbols }`,
        `${ packFolder }/${ package2 }`,
        `${ packFolder }/${ notAPackage }`
      ];
      const expected = toCreate
        .filter(s => !s.includes(notAPackage))
        .map(
          rel => sandbox.fullPathFor(rel)
        );

      for (const file of toCreate) {
        await sandbox.writeFile(file, "test");
      }
      // Act
      const result = await sandbox.run(async () => await sut());

      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should return all packages under a custom packages folder`, async () => {
      // Arrange
      process.env[env.PACK_TARGET_FOLDER] = "packages2";
      const
        sandbox = await Sandbox.create(),
        packFolder = env.resolve(env.PACK_TARGET_FOLDER),
        package1 = "foo.bar.nupkg",
        package1Symbols = "foo.bar.symbols.nupkg",
        package2 = "quux.cow.nupkg",
        notAPackage = "README.md";

      expect(packFolder)
        .toEqual("packages2");

      const toCreate = [
        `${ packFolder }/${ package1 }`,
        `${ packFolder }/${ package1Symbols }`,
        `${ packFolder }/${ package2 }`,
        `${ packFolder }/${ notAPackage }`
      ];
      const expected = toCreate
        .filter(s => !s.includes(notAPackage))
        .map(
          rel => sandbox.fullPathFor(rel)
        );

      for (const file of toCreate) {
        await sandbox.writeFile(file, "test");
      }
      // Act
      const result = await sandbox.run(async () => await sut());

      // Assert
      expect(result)
        .toEqual(expected);
    });
  });

  describe(`when ${ env.NUGET_PUSH_PACKAGES } is defined`, () => {
    it(`should return named relative package under the packages folder`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        packFolder = env.resolve(env.PACK_TARGET_FOLDER),
        package1 = "foo.bar.nupkg",
        package1Symbols = "foo.bar.symbols.nupkg",
        package2 = "quux.cow.nupkg",
        // force an ambiguity
        notAPackage = "foo.bar.md";

      const toCreate = [
        `${ packFolder }/${ package1 }`,
        `${ packFolder }/${ package1Symbols }`,
        `${ packFolder }/${ package2 }`,
        `${ packFolder }/${ notAPackage }`
      ];

      process.env[env.NUGET_PUSH_PACKAGES] = "foo.bar";
      const expected = [
        sandbox.fullPathFor(`${ packFolder }/${ package1 }`),
        sandbox.fullPathFor(`${ packFolder }/${ package1Symbols }`),
      ];

      for (const file of toCreate) {
        await sandbox.writeFile(file, "test");
      }
      // Act
      const result = await sandbox.run(async () => await sut());

      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should return named relative package under the packages folder (2)`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        packFolder = env.resolve(env.PACK_TARGET_FOLDER),
        package1 = "foo.bar.nupkg",
        package1Symbols = "foo.bar.symbols.nupkg",
        package2 = "quux.cow.nupkg",
        // force an ambiguity
        notAPackage = "foo.bar.md";

      const toCreate = [
        `${ packFolder }/${ package1 }`,
        `${ packFolder }/${ package1Symbols }`,
        `${ packFolder }/${ package2 }`,
        `${ packFolder }/${ notAPackage }`
      ];

      process.env[env.NUGET_PUSH_PACKAGES] = "foo.bar.nupkg";
      const expected = [
        sandbox.fullPathFor(`${ packFolder }/${ package1 }`)
      ];

      for (const file of toCreate) {
        await sandbox.writeFile(file, "test");
      }
      // Act
      const result = await sandbox.run(async () => await sut());

      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should return named relative packages under the packages folder`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        packFolder = env.resolve(env.PACK_TARGET_FOLDER),
        package1 = "foo.bar.nupkg",
        package1Symbols = "foo.bar.symbols.nupkg",
        package2 = "quux.cow.nupkg",
        // force an ambiguity
        notAPackage = "foo.bar.md";

      const toCreate = [
        `${ packFolder }/${ package1 }`,
        `${ packFolder }/${ package1Symbols }`,
        `${ packFolder }/${ package2 }`,
        `${ packFolder }/${ notAPackage }`
      ];

      process.env[env.NUGET_PUSH_PACKAGES] = "foo.bar,quux.cow";
      const expected = [
        sandbox.fullPathFor(`${ packFolder }/${ package1 }`),
        sandbox.fullPathFor(`${ packFolder }/${ package1Symbols }`),
        sandbox.fullPathFor(`${ packFolder }/${ package2 }`),
      ];

      for (const file of toCreate) {
        await sandbox.writeFile(file, "test");
      }
      // Act
      const result = await sandbox.run(async () => await sut());

      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should return named relative package under some other folder`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        packFolder = env.resolve(env.PACK_TARGET_FOLDER),
        otherFolder = faker.string.alpha(16),
        package1 = "foo.bar.nupkg",
        package1Symbols = "foo.bar.symbols.nupkg",
        package2 = "quux.cow.nupkg",
        // force an ambiguity
        notAPackage = "foo.bar.md";

      expect(otherFolder)
        .not.toEqual(packFolder);

      const toCreate = [
        `${ otherFolder }/${ package1 }`,
        `${ otherFolder }/${ package1Symbols }`,
        `${ otherFolder }/${ package2 }`,
        `${ otherFolder }/${ notAPackage }`
      ];

      process.env[env.NUGET_PUSH_PACKAGES] = `${otherFolder}/foo.bar.nupkg`;
      const expected = [
        sandbox.fullPathFor(`${ otherFolder }/${ package1 }`)
      ];

      for (const file of toCreate) {
        await sandbox.writeFile(file, "test");
      }
      // Act
      const result = await sandbox.run(async () => await sut());

      // Assert
      expect(result)
        .toEqual(expected);
    });


  });
});
