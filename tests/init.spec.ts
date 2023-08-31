import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
const sut = require("../index-modules/handlers/init");

describe(`init`, () => {
  describe(`test function`, () => {
    describe(`when args contains --init`, () => {
      it(`should return true`, async () => {
        // Arrange
        const args = ["--init"];
        // Act
        const result = sut.test(args);
        // Assert
        expect(result).toBeTrue();
      });
    });
    describe(`otherwise`, () => {
      it(`should return false`, async () => {
        // Arrange
        const args = [ "build" ];
        // Act
        const result = sut.test(args);
        // Assert
        expect(result).toBeFalse();
      });
    });
  });

  describe(`handler`, () => {
    afterAll(async () => {
      await Sandbox.destroyAll();
    });
    describe(`when zarro script is missing`, () => {
      it(`should add the zarro script`, async () => {
        // Arrange
        const log = requireModule<Log>("log");
        spyOn(log, "info");
        spyOn(log, "debug");
        spyOn(log, "warn");
        spyOn(log, "notice");
        const sandbox = await Sandbox.create();
        const pkg = {
        };
        await sandbox.writeFile("package.json", JSON.stringify(pkg));
        // Act
        await sut.handler(sandbox.fullPathFor("package.json"));
        // Assert
        const contents = await sandbox.readTextFile("package.json");
        const newPkg = JSON.parse(contents);
        expect(newPkg.scripts).toBeDefined();
        expect(newPkg.scripts["zarro"]).toEqual("zarro");
        expect(log.info).toHaveBeenCalledWith("run zarro with 'npm run zarro -- {tasks or gulp arguments}')");
        expect(log.info).toHaveBeenCalledWith("eg: 'npm run zarro -- build' to attempt .net project build");
        expect(log.info).toHaveBeenCalledWith("get more help with 'npm run zarro -- --help'");

        expect(log.warn)
            .not.toHaveBeenCalled();
        expect(log.notice)
            .not.toHaveBeenCalled();
        expect(log.debug)
            .not.toHaveBeenCalled();
      });
    });

  });
});
