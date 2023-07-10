import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { boolean } from "yargs";

const sut = requireModule<CsprojUtils>("csproj-utils");

describe(`csproj-utils`, () => {
  describe(`readPackageVersion`, () => {
    const { readPackageVersion } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(readPackageVersion)
        .toBeFunction();
      // Assert
    });

    it(`should read the package version`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        csproj = await sandbox.writeFile("sample.csproj", csprojXml);
      // Act
      const result = await readPackageVersion(csproj);
      // Assert
      expect(result)
        .toEqual("8.3.5");
    });
  });

  describe(`readProjectVersion`, () => {
    const { readProjectVersion } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(readProjectVersion)
        .toBeFunction();
      // Assert
    });

    it(`should read the project version`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        csproj = await sandbox.writeFile("sample.csproj", csprojXml);
      // Act
      const result = await readProjectVersion(csproj);
      // Assert
      expect(result)
        .toEqual("1.0.171");
    });
    it(`should fall back on 1.0.0`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        filtered = filterCsprojXml(
          line => line.indexOf("<Version>") === -1
        ),
        csproj = await sandbox.writeFile("sample.csproj", filtered);
      // Act
      const result = await readProjectVersion(csproj);
      // Assert
      expect(result)
        .toEqual("1.0.0");
    });
  });

  describe(`readAssemblyVersion`, () => {
    const { readAssemblyVersion } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(readAssemblyVersion)
        .toBeFunction();
      // Assert
    });
    it(`should read the assembly version`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        csproj = await sandbox.writeFile("sample.csproj", csprojXml);
      // Act
      const result = await readAssemblyVersion(csproj);
      // Assert
      expect(result)
        .toEqual("3.5.4");
    });
    it(`should fall back on 1.0.0`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        filtered = filterCsprojXml(
          line => line.indexOf("<AssemblyVersion>") === -1
        ),
        csproj = await sandbox.writeFile("sample.csproj", filtered);
      // Act
      const result = await readAssemblyVersion(csproj);
      // Assert
      expect(result)
        .toEqual("1.0.0");
    });
  });

  describe(`readAssemblyName`, () => {
    const { readAssemblyName } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(readAssemblyName)
        .toBeFunction();
      // Assert
    });
    it(`should read the assembly name`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        csproj = await sandbox.writeFile("sample.csproj", csprojXml);
      // Act
      const result = await readAssemblyName(csproj);
      // Assert
      expect(result)
        .toEqual("Foo.Bar");
    });
    it(`should fall back on the project file base name`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create(),
        modified = filterCsprojXml(
          line => line.indexOf("<AssemblyName>") === -1
        ),
        csproj = await sandbox.writeFile("sample.csproj", modified);
      // Act
      const result = await readAssemblyName(csproj);
      // Assert
      expect(result)
        .toEqual("sample");
    });
  });

  function filterCsprojXml(
    filter: (line: string) => boolean
  ): string {
    const
      lines = csprojXml.split("\n"),
      filtered = lines.filter(filter);
    return filtered.join("\n");
  }

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
