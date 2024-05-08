import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import path from "path";

describe(`dotnet-cli:create`, () => {
  const { create } = requireModule<DotNetCli>("dotnet-cli");
  it(`should be a function`, async () => {
    // Arrange
    // Act
    expect(create)
      .toBeFunction();
    // Assert
  });

  afterAll(async () => await Sandbox.destroyAll());

  it(`should be able to create a new project`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      project = `test-project-${ faker.word.sample(2).replace(/\s+/g, "-") }`;
    // Act
    const result = await create({
      template: "classlib",
      name: project,
      cwd: sandbox.path
    });
    // Assert
    expect(result)
      .toBeFile();
    expect(result)
      .toStartWith(sandbox.path);
    expect(result)
      .toEndWith(".csproj")
    const
      parts = result.split(/[\\/]/g),
      projectFile = parts[parts.length - 1],
      projectDir = parts[parts.length - 2],
      remainder = parts.slice(0, parts.length - 2),
      basePath = remainder.join(path.sep);
    debugger;
    expect(basePath)
      .toEqual(sandbox.path);
    expect(projectFile)
      .toEqual(`${ project }.csproj`);
    expect(projectDir)
      .toEqual(project);
  });

  it(`should be able to create a new solution`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      solution = `test-sln-${ faker.word.sample(2).replace(/\s+/g, "-") }`,
      expected = sandbox.fullPathFor(`${ solution }.sln`);
    // Act
    const result = await create({
      template: "sln",
      name: solution,
      cwd: sandbox.path
    });
    // Assert
    expect(result)
      .toEqual(expected);
    expect(result)
      .toBeFile();
  });
});
