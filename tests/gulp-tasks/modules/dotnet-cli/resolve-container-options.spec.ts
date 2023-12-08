import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { Sandbox } from "filesystem-sandbox";
import path from "path";

const {
  anything,
  system,
  disableSystemCallThrough,
  mockSystem,
  mockUpdatePackageNuspec,
} = require("./common");

describe(`resolveContainerOptions`, () => {
  let allowLogs = false;
  beforeEach(() => {
    allowLogs = false;
    mockSystem();
    mockUpdatePackageNuspec();
    disableSystemCallThrough();
    const original = console.log;
    spyOn(console, "log").and.callFake((...args: any[]) => {
      if (!allowLogs) {
        return;
      }
      original.apply(console, args);
    });
  });
  afterEach(async () => {
    await Sandbox.destroyAll();
  })
  const env = requireModule<Env>("env");
  const sut = requireModule<DotNetCli>("dotnet-cli");
  const { resolveContainerOptions } = sut;

  it(`should be a function`, async () => {
    // Arrange
    // Act
    expect(resolveContainerOptions)
      .toBeFunction();
    // Assert
  });

  it(`should resolve provided tag`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      projFile = `${ faker.word.sample() }.csproj`,
      expected = {
        option: "containerImageTag",
        value: "1.2.3",
        environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_TAG,
        usingFallback: false
      } as ResolvedContainerOption,
      target = await sandbox.writeFile(projFile, csprojXml);
    // Act
    const result = await resolveContainerOptions({
      target,
      publishContainer: true,
      containerImageTag: "1.2.3"
    })
    // Assert
    const opt = result.find(o => o.option == "containerImageTag");
    expect(opt)
      .toEqual(expected);
  });

  it(`should resolve fallback tag`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      projFile = `${ faker.word.sample() }.csproj`,
      expected = {
        option: "containerImageTag",
        value: "3.5.4",
        environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_TAG,
        usingFallback: true
      } as ResolvedContainerOption,
      target = await sandbox.writeFile(projFile, csprojXml);
    // Act
    const result = await resolveContainerOptions({
      target,
      publishContainer: true
    })
    // Assert
    const opt = result.find(o => o.option == "containerImageTag");
    expect(opt)
      .toEqual(expected);
  });

  it(`should resolve registry from options`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      projFile = `${ faker.word.sample() }.csproj`,
      registry = faker.internet.domainName(),
      expected = {
        option: "containerRegistry",
        value: registry,
        environmentVariable: env.DOTNET_PUBLISH_CONTAINER_REGISTRY,
        usingFallback: false
      } as ResolvedContainerOption,
      target = await sandbox.writeFile(projFile, csprojXml);
    // Act
    const result = await resolveContainerOptions({
      target,
      publishContainer: true,
      containerRegistry: registry
    })
    // Assert
    const opt = result.find(o => o.option == "containerRegistry");
    expect(opt)
      .toEqual(expected);
  });

  it(`should resolve registry from csproj`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      projFile = `${ faker.word.sample() }.csproj`,
      expected = {
        option: "containerRegistry",
        value: "foo.bar.com",
        environmentVariable: env.DOTNET_PUBLISH_CONTAINER_REGISTRY,
        usingFallback: true
      } as ResolvedContainerOption,
      target = await sandbox.writeFile(projFile, csprojXml);
    // Act
    const result = await resolveContainerOptions({
      target,
      publishContainer: true
    })
    // Assert
    const opt = result.find(o => o.option == "containerRegistry");
    expect(opt)
      .toEqual(expected);
  });

  it(`should fall back on localhost when no registry specified via options or csproj`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      projFile = `${ faker.word.sample() }.csproj`,
      expected = {
        option: "containerRegistry",
        value: "localhost",
        environmentVariable: env.DOTNET_PUBLISH_CONTAINER_REGISTRY,
        usingFallback: true
      } as ResolvedContainerOption,
      modified = csprojXml.split("\n").filter(
        line => line.indexOf("<ContainerRegistry>") === -1
      ).join("\n"),
      target = await sandbox.writeFile(projFile, modified);
    // Act
    const result = await resolveContainerOptions({
      target,
      publishContainer: true
    })
    // Assert
    const opt = result.find(o => o.option == "containerRegistry");
    expect(opt)
      .toEqual(expected);
  });

  it(`should resolve the container name from the options`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      projFile = `${ faker.word.sample() }.csproj`,
      containerImageName = faker.word.sample(),
      expected = {
        option: "containerImageName",
        value: containerImageName,
        environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
        usingFallback: false
      } as ResolvedContainerOption,
      target = await sandbox.writeFile(projFile, csprojXml);
    // Act
    const result = await resolveContainerOptions({
      target,
      publishContainer: true,
      containerImageName
    })
    // Assert
    const opt = result.find(o => o.option == "containerImageName");
    expect(opt)
      .toEqual(expected);
  });

  it(`should resolve the container name from csproj`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      projFile = `${ faker.word.sample() }.csproj`,
      expected = {
        option: "containerImageName",
        value: "yellow-submarine",
        environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
        usingFallback: true
      } as ResolvedContainerOption,
      target = await sandbox.writeFile(projFile, csprojXml);
    // Act
    const result = await resolveContainerOptions({
      target,
      publishContainer: true
    })
    // Assert
    const opt = result.find(o => o.option == "containerImageName");
    expect(opt)
      .toEqual(expected);
  });

  it(`should fall back on the assembly name for the container name`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      projectName = faker.word.sample(),
      projFile = `${ projectName }.csproj`,
      expected = {
        option: "containerImageName",
        value: "Foo.Bar",
        environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
        usingFallback: true
      } as ResolvedContainerOption,
      filtered = csprojXml.split("\n").filter(
        line => line.indexOf("<ContainerImageName>") === -1
      ).join("\n"),
      target = await sandbox.writeFile(projFile, filtered);
    // Act
    const result = await resolveContainerOptions({
      target,
      publishContainer: true
    })
    // Assert
    const opt = result.find(o => o.option == "containerImageName");
    expect(opt)
      .toEqual(expected);
  });

  it(`should fall back on the project name for the container name`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      projectName = faker.word.sample(),
      projFile = `${ projectName }.csproj`,
      expected = {
        option: "containerImageName",
        value: projectName,
        environmentVariable: env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
        usingFallback: true
      } as ResolvedContainerOption,
      filtered = csprojXml.split("\n").filter(
        line => line.indexOf("<ContainerImageName>") === -1 &&
                line.indexOf("<AssemblyName>") === -1
      ).join("\n"),
      target = await sandbox.writeFile(projFile, filtered);
    // Act
    const result = await resolveContainerOptions({
      target,
      publishContainer: true
    })
    // Assert
    const opt = result.find(o => o.option == "containerImageName");
    expect(opt)
      .toEqual(expected);
  });

  const csprojXml =
    `
    <Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <DebugType>full</DebugType>
    <LangVersion>latest</LangVersion>
    <TargetFrameworks>netstandard2.0;net452;net462</TargetFrameworks>
    <Configurations>Debug;Release;BuildForRelease</Configurations>
    <TreatWarningsAsErrors>True</TreatWarningsAsErrors>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <Version>1.0.171</Version>
    <AssemblyVersion>3.5.4</AssemblyVersion>
    <AssemblyName>Foo.Bar</AssemblyName>
    <ContainerRegistry>foo.bar.com</ContainerRegistry>
    <ContainerImageName>yellow-submarine</ContainerImageName>
  </PropertyGroup>
  <PropertyGroup>
    <PackageVersion>8.3.5</PackageVersion>
    <DefaultLanguage>en-US</DefaultLanguage>
    <PackageProjectUrl>https://github.com/fluffynuts/NExpect</PackageProjectUrl>
    <PackageLicenseExpression>BSD-3-Clause</PackageLicenseExpression>
    <PackageRequireLicenseAcceptance>False</PackageRequireLicenseAcceptance>
    <PackageIcon>icon.png</PackageIcon>
    <PackageIconUrl>https://raw.githubusercontent.com/fluffynuts/NExpect/master/src/NExpect/icon.png</PackageIconUrl>
    <Copyright>Copyright 2017</Copyright>
    <Authors>

      Davyd McColl

      Cobus Smit

    </Authors>
    <Description>

      Unit-test-framework-agnostic Expect-style assertions for .NET



      NExpect Provides Expect() syntax for doing assertions in .NET. Framework-agnostic, throwing

      UnmetExpectationExceptions for failures. Assertion exception type can be overridden at run-time.

      NExpect has grammar inspired by Chai and extensibility inspired by Jasmine.

    </Description>
  </PropertyGroup>
  <PropertyGroup Condition="'$(TargetFramework)'=='netstandard2.0'">
    <DefineConstants>NETSTANDARD</DefineConstants>
  </PropertyGroup>
  <PropertyGroup>
    <DefineConstants>BUILD_PEANUTBUTTER_INTERNAL</DefineConstants>
  </PropertyGroup>
  <ItemGroup>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\ArrayExtensions.cs" Link="Imported\\ArrayExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\AutoLocker.cs" Link="Imported\\AutoLocker.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\ByteArrayExtensions.cs" Link="Imported\\ByteArrayExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\DeepEqualityTester.cs" Link="Imported\\DeepEqualityTester.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\EnumerableWrapper.cs" Link="Imported\\EnumerableWrapper.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\ObjectExtensions.cs" Link="Imported\\ObjectExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\ExtensionsForIEnumerables.cs" Link="Imported\\ExtensionsForIEnumerables.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\MetadataExtensions.cs" Link="Imported\\MetadataExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\MemberNotFoundException.cs" Link="Imported\\MemberNotFoundException.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\PropertyOrField.cs" Link="Imported\\PropertyOrField.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\PyLike.cs" Link="Imported\\PyLike.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\StringExtensions.cs" Link="Imported\\StringExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\Stringifier.cs" Link="Imported\\Stringifier.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\TypeExtensions.cs" Link="Imported\\TypeExtensions.cs"/>
    <Compile Include="..\\PeanutButter\\source\\Utils\\PeanutButter.Utils\\Types.cs" Link="Imported\\Types.cs"/>
  </ItemGroup>
  <ItemGroup Condition="'$(TargetFramework)'=='netstandard1.6'">
    <Reference Include="System.Diagnostics.StackTrace"/>
  </ItemGroup>
  <ItemGroup>
    <None Include="icon.png" Pack="true" PackagePath=""/>
  </ItemGroup>
  <Import Project="..\\MonoForFramework.targets"/>
</Project>
    `;


});
