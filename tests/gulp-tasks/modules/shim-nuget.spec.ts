import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { copyFile, rm, readTextFile } from "yafs";
import * as path from "path";

describe(`shim-nuget`, () => {
  const
    isWindows = requireModule<IsWindows>("is-windows"),
    findLocalNuget = requireModule<FindLocalNuget>("find-local-nuget"),
    sut = requireModule<ShimNuget>("shim-nuget");

  if (isWindows()) {
    describe(`on windows`, () => {
      it(`should return the path provided`, async () => {
        // Arrange
        const
          sandbox = await Sandbox.create(),
          nugetPath = await sandbox.writeFile("nuget.exe", "");
        // Act
        const result = sut(nugetPath);
        // Assert
        expect(result)
          .toEqual(nugetPath);
      });
    });
  } else {
    describe(`on !windows`, () => {
      it(`should return the shim when given the .exe`, async () => {
        // Arrange
        const
          sandbox = await Sandbox.create(),
          localNuget = await findLocalNuget(),
          localNugetFolder = path.dirname(localNuget),
          localNugetBinary = path.join(localNugetFolder, "nuget.exe"),
          sandboxNugetBinary = sandbox.fullPathFor("nuget.exe"),
          sandboxShim = sandbox.fullPathFor("nuget");
        expect(localNugetBinary)
          .toBeFile();

        await copyFile(localNugetBinary, sandboxNugetBinary)
        // Act
        const result = sut(sandboxNugetBinary);
        // Assert
        expect(result)
          .toEqual(sandboxShim);
        const contents = await readTextFile(result);
        expect(contents.indexOf("#!/bin/sh"))
          .toEqual(0);
        expect(contents)
          .toContain("mono");
        expect(contents)
          .toContain("$(dirname $0)/nuget.exe");
      });
    });
  }
});
