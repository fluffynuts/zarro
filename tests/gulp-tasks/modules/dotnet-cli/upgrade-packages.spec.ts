import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";

describe(`dotnet-cli:upgradePackages`, () => {
  const {
    create,
    installPackage,
    listPackages,
    upgradePackages
  } = requireModule<DotNetCli>("dotnet-cli");
  const Version = requireModule<Version>("version");
  it(`should upgrade the single named package`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      projectName = faker.string.alphanumeric({ length: 12 });

    const projectFile = await create({
      template: "classlib",
      name: projectName,
      cwd: sandbox.path
    });

    await installPackage({
      cwd: sandbox.path,
      projectFile,
      id: "NExpect",
      version: "2.0.1"
    });

    const
      installed = await listPackages(projectFile),
      originalNExpect = installed.find(o => o.id.toLowerCase() === "nexpect");
    expect(originalNExpect)
      .toExist();
    expect(originalNExpect?.version)
      .toEqual("2.0.1");

    // Act
    await upgradePackages({
      pathToProjectOrSolution: projectFile,
      packages: [ "NExpect" ]
    });
    // Assert
    const
      currentlyInstalled = await listPackages(projectFile),
      nexpect = currentlyInstalled.find(o => o.id.toLowerCase() === "nexpect");

    expect(nexpect)
      .toExist();
    const version = new Version(`${nexpect?.version}`);
    expect(version.isGreaterThan("2.0.1"))
      .toBeTrue();
  });
});
