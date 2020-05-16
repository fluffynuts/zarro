"use strict";
describe(`read-nuspec-version`, () => {
    const sut = require("../../../gulp-tasks/modules/read-nuspec-version"), Sandbox = require("../../helpers/sandbox");
    it(`should read the version from a nuspec file`, async () => {
        // Arrange
        const sandbox = Sandbox.create(), fileName = "package.nuspec", fullPath = await sandbox.writeTextFile(fileName, packageNuspec);
        // Act
        const result = await sut(fullPath);
        // Assert
        expect(result)
            .toEqual("1.0.158");
    });
    afterAll(async () => {
        await Sandbox.destroyAll();
    });
    const packageNuspec = `
  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<package>
  <metadata>
    <id>NExpect.Matchers.AspNetCore</id>
    <version>1.0.158</version>
    <title>NExpect.Matchers.AspNetCore</title>
    <authors>Davyd McColl</authors>
    <owners>Davyd McColl</owners>
    <description>&#xD;&#xD;&#xD;&#xD;&#xD;
        ASP.Net core extensions for NExpect&#xD;&#xD;&#xD;&#xD;&#xD;
    </description>
    <releaseNotes>&#xD;&#xD;&#xD;&#xD;&#xD;
    </releaseNotes>
    <summary>&#xD;&#xD;&#xD;&#xD;&#xD;
      NExpect Provides Expect() syntax for doing assertions in .NET. Framework-agnostic, throwing&#xD;&#xD;&#xD;&#xD;&#xD;
      UnmetExpectationExceptions for failures. Assertion exception type can be overridden at run-time.&#xD;&#xD;&#xD;&#xD;&#xD;
      NExpect has grammar inspired by Chai and extensibility inspired by Jasmine.&#xD;&#xD;&#xD;&#xD;&#xD;
      &#xD;&#xD;&#xD;&#xD;&#xD;
      This library adds ASP.Net core extensions for NExpect so you can test your&#xD;&#xD;&#xD;&#xD;&#xD;
      [Route] and [Http*] annotations like so:&#xD;&#xD;&#xD;&#xD;&#xD;
      \`\`\`&#xD;&#xD;&#xD;&#xD;&#xD;
      Expect(typeof(SomeController)&#xD;&#xD;&#xD;&#xD;&#xD;
      .To.Have.Method(nameof(SomeController.MethodName))&#xD;&#xD;&#xD;&#xD;&#xD;
      .Supporting(HttpMethod.Delete)&#xD;&#xD;&#xD;&#xD;&#xD;
      .And(HttpMethod.Post)&#xD;&#xD;&#xD;&#xD;&#xD;
      .With.Route("first-route")&#xD;&#xD;&#xD;&#xD;&#xD;
      .And.Route("second-route");&#xD;&#xD;&#xD;&#xD;&#xD;
      \`\`\`&#xD;&#xD;&#xD;&#xD;&#xD;
    </summary>
    <language>en-US</language>
    <projectUrl>https://github.com/fluffynuts/NExpect</projectUrl>
    <icon>icon.png</icon>
    <requireLicenseAcceptance>false</requireLicenseAcceptance>
    <license type="expression">BSD-3-Clause</license>
    <copyright>Copyright 2019</copyright>
    <dependencies>
      <group targetFramework="net452">
        <dependency id="NExpect" version="1.0.159"/>
        <dependency id="Microsoft.AspNetCore.Mvc.Core" version="4.1.0"/>
      </group>
      <group targetFramework="netstandard2.0">
        <dependency id="NExpect" version="1.0.159"/>
        <dependency id="Microsoft.AspNetCore.Mvc.Core" version="4.1.0"/>
      </group>
    </dependencies>
    <references/>
    <tags/>
  </metadata>
  <files>
    <file src="icon.png" target="" />
    <file src="bin\\BuildForRelease\\netstandard2.0\\NExpect.Matchers.AspNetCore.xml" target="lib\\net452"/>
    <file src="bin\\BuildForRelease\\netstandard2.0\\NExpect.Matchers.AspNetCore.dll" target="lib\\netstandard2.0"/>
    <file src="bin\\BuildForRelease\\netstandard2.0\\NExpect.Matchers.AspNetCore.xml" target="lib\\netstandard2.0"/>
    <file src="bin\\BuildForRelease\\netstandard2.0\\NExpect.Matchers.AspNetCore.pdb" target="lib\\netstandard2.0"/>
    <file src="bin\\BuildForRelease\\netstandard2.0\\NExpect.Matchers.AspNetCore.deps.json" target="lib\\netstandard2.0"/>
  </files>
</package>
  `;
});
