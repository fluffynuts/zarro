import "expect-even-more-jest";
import os from "os";
import { Sandbox } from "filesystem-sandbox";
import { faker } from "@faker-js/faker";
import { readTextFile } from "yafs";

describe(`system`, () => {
  const sut = requireModule<System>("system");
  describe(`default`, () => {
    it(`should run the program, output the output and return the exit code + stdio`, async () => {
      // Arrange
      const
        spy = spyOn(console, "log"),
        username = (os.userInfo().username as string).toLowerCase();
      // Act
      const result = await sut("whoami");
      // Assert
      expect(result.exitCode)
        .toEqual(0);
      expect(result.stdout)
        .not.toBeEmptyArray();
      expect(result.stdout.filter(l => l.indexOf(username) > -1))
        .not.toBeEmptyArray();
      expect(result.stderr)
        .toBeEmptyArray();
      expect(console.log)
        .toHaveBeenCalledOnce();
      spy.calls
      const args = spy.calls.mostRecent().args;
      expect(args[0])
        .toContain(username);
    });
  });

  if (os.platform() === "win32") {
    describe(`batch file`, () => {
      it(`should run it and return the result`, async () => {
        // Arrange
        spyOn(console, "log");
        const
          sandbox = await Sandbox.create(),
          bat = `${ faker.word.words(1) }.bat`;
        await sandbox.writeFile(bat, "@echo hello world");
        // Act
        const result = await sut(sandbox.fullPathFor(bat));
        // Assert
        expect(result.exitCode)
          .toEqual(0);
        expect(result.stdout)
          .toContain("hello world");
        expect(console.log)
          .toHaveBeenCalledWith("hello world");
      });

      afterEach(async () => {
        await Sandbox.destroyAll();
      });
    });
  }
  describe(`passing arguments`, () => {
    it(`should pass the arguments`, async () => {
      // Arrange
      spyOn(console, "log");
      const
        words = [
          faker.word.sample(),
          faker.word.sample()
        ],
        sandbox = await Sandbox.create();
      await sandbox.writeFile(
        "index.js",
        `console.log(
          process.argv.slice(2).join(" ")
        );
        `);

      // Act
      const result = await sut("node", [ sandbox.fullPathFor("index.js") ].concat(words));
      // Assert
      expect(result.exitCode)
        .toEqual(0);
      expect(result.stdout)
        .toEqual([ words.join(" ") ]);
    });

    afterEach(async () => {
      await Sandbox.destroyAll();
    });
  });

  describe(`stderr`, () => {
    it(`should return back stderr`, async () => {
      // Arrange
      spyOn(console, "error");
      const
        words = [
          faker.word.sample(),
          faker.word.sample()
        ],
        sandbox = await Sandbox.create();
      await sandbox.writeFile(
        "index.js",
        `console.error(
          process.argv.slice(2).join(" ")
        );
        `);
      // Act
      const result = await sut("node", [ sandbox.fullPathFor("index.js") ].concat(words));
      // Assert
      expect(result.exitCode)
        .toEqual(0);
      expect(result.stderr)
        .toEqual([ words.join(" ") ]);
    });
  });

  describe(`when process exits with non-zero status`, () => {
    it(`should throw with all the info`, async () => {
      // Arrange
      spyOn(console, "log");
      spyOn(console, "error");
      const
        words = [
          faker.word.sample(),
          faker.word.sample()
        ],
        sandbox = await Sandbox.create();
      await sandbox.writeFile(
        "foo.js",
        `
            console.log(process.argv[2])
            console.error(process.argv[3]);
            process.exit(2);
          `
      );
      const args = [ sandbox.fullPathFor("foo.js") ].concat(words);
      // Act
      try {
        await sut("node", args);
      } catch (e) {
        const err = e as SpawnError;
        expect(err.exitCode)
          .toEqual(2);
        expect(err.stdout)
          .toEqual([ words[0] ]);
        expect(err.stderr)
          .toEqual([ words[1] ]);
        expect(err.exe)
          .toEqual("node");
        expect(err.args)
          .toEqual(args);
        expect(console.log)
          .toHaveBeenCalledOnceWith(words[0]);
        expect(console.error)
          .toHaveBeenCalledOnceWith(words[1]);
        return;
      }
      throw new Error(`should have thrown above`);
      // Assert
    });
  });

  describe(`io suppression`, () => {
    describe(`when process exits normally`, () => {
      it(`should still gather io, just not emit it`, async () => {
        // Arrange
        spyOn(console, "log");
        spyOn(console, "error");
        const
          words = [
            faker.word.sample(),
            faker.word.sample()
          ],
          sandbox = await Sandbox.create();
        await sandbox.writeFile(
          "foo.js",
          `
            console.log(process.argv[2])
            console.error(process.argv[3]);
            process.exit(0);
          `
        );
        const args = [ sandbox.fullPathFor("foo.js") ].concat(words);
        // Act
        const result = await sut("node", args, { suppressOutput: true });
        // Assert
        expect(result.exitCode)
          .toEqual(0);
        expect(result.stdout)
          .toEqual([ words[0] ]);
        expect(result.stderr)
          .toEqual([ words[1] ]);
        expect(console.log)
          .not.toHaveBeenCalled();
        expect(console.error)
          .not.toHaveBeenCalled();
      });
    });

    describe(`when process exits abnormally`, () => {
      it(`should still gather io, just not emit it`, async () => {
        // Arrange
        spyOn(console, "log");
        spyOn(console, "error");
        const
          words = [
            faker.word.sample(),
            faker.word.sample()
          ],
          sandbox = await Sandbox.create();
        await sandbox.writeFile(
          "foo.js",
          `
            console.log(process.argv[2])
            console.error(process.argv[3]);
            process.exit(2);
          `
        );
        const args = [ sandbox.fullPathFor("foo.js") ].concat(words);
        // Act
        try {
          await sut("node", args, {
            suppressOutput: true
          });
        } catch (e) {
          const err = e as SpawnError;
          expect(err.exitCode)
            .toEqual(2);
          expect(err.stdout)
            .toEqual([ words[0] ]);
          expect(err.stderr)
            .toEqual([ words[1] ]);
          expect(err.exe)
            .toEqual("node");
          expect(err.args)
            .toEqual(args);
          expect(console.log)
            .not.toHaveBeenCalled();
          expect(console.error)
            .not.toHaveBeenCalled();
          return;
        }
        throw new Error(`should have thrown above`);
        // Assert
      });
    });
  });

  describe(`quoting`, () => {
    it(`should quote arguments with whitespace by default (handled by child_process now)`, async () => {
      // Arrange
      spyOn(console, "log");
      spyOn(console, "error");
      const
        words = [
          [ faker.word.sample(), faker.word.sample() ].join(" "),
          [ faker.word.sample(), faker.word.sample() ].join("\t")
        ],
        sandbox = await Sandbox.create();
      await sandbox.writeFile(
        "foo.js",
        `
        (async function() {
          console.log(process.argv[2])
          console.error(process.argv[3]);
        })();
          `
      );
      const args = [ sandbox.fullPathFor("foo.js") ].concat(words);
      // Act
      const result = await sut("node", args);
      // Assert
      expect(result.stdout)
        .toEqual([ `${ words[0] }` ]);
      expect(result.stderr)
        .toEqual([ `${ words[1] }` ]);
    });
  });

  describe(`io`, () => {
    it(`should use provided io functions`, async () => {
      // Arrange
      spyOn(console, "log");
      spyOn(console, "error");
      const
        words = [
          [ faker.word.sample(), faker.word.sample() ].join(" "),
          [ faker.word.sample(), faker.word.sample() ].join("\t")
        ],
        collectedStdErr = [] as string[],
        collectedStdOut = [] as string[],
        sandbox = await Sandbox.create();
      await sandbox.writeFile(
        "foo.js",
        `
        (async function() {
          console.log(process.argv[2])
          console.error(process.argv[3]);
        })();
          `
      );
      const args = [ sandbox.fullPathFor("foo.js") ].concat(words);
      // Act
      await sut("node", args, {
        stdout: s => collectedStdOut.push(s),
        stderr: s => collectedStdErr.push(s)
      });
      // Assert
      expect(collectedStdOut)
        .toEqual([ words[0] ]);
      expect(collectedStdErr)
        .toEqual([ words[1] ]);
      expect(console.log)
        .not.toHaveBeenCalled();
      expect(console.error)
        .not.toHaveBeenCalled();
    });

    it(`should output stdio when enabled`, async () => {
      // Arrange
      spyOn(console, "log");
      spyOn(console, "error");
      const
        words = [
          [ faker.word.sample(), faker.word.sample() ].join(" "),
          [ faker.word.sample(), faker.word.sample() ].join("\t")
        ],
        collectedStdErr = [] as string[],
        collectedStdOut = [] as string[],
        sandbox = await Sandbox.create();
      await sandbox.writeFile(
        "foo.js",
        `
        (async function() {
          console.log(process.argv[2])
          console.error(process.argv[3]);
        })();
          `
      );
      const args = [ sandbox.fullPathFor("foo.js") ].concat(words);
      // Act
      await sut("node", args, {
        stdout: s => collectedStdOut.push(s),
        stderr: s => collectedStdErr.push(s),
        suppressOutput: false
      });
      // Assert
      expect(collectedStdOut)
        .toEqual([ words[0] ]);
      expect(collectedStdErr)
        .toEqual([ words[1] ]);
      expect(console.log)
        .toHaveBeenCalledOnceWith(words[0]);
      expect(console.error)
        .toHaveBeenCalledOnceWith(words[1]);
    });
  });

  describe(`given long commandline`, () => {
    it(`should spawn with default shell`, async () => {
      // Arrange
      // spyOn(console, "log");
      const
        sandbox = await Sandbox.create(),
        fileName = faker.system.fileName(),
        file = await sandbox.writeFile(fileName, "");
      // Act
      await sut(`echo foo >> ${ file }`);
      // Assert
      const contents = await readTextFile(file);
      expect(contents.trim())
        .toEqual("foo");
    });
  });

  describe(`timeout`, () => {
    it(`should spawn the process and kill it after the timeout`, async () => {
      // Arrange
      // Act
      const before = Date.now();
      const result = await sut("cmd", [], { timeout: 100, suppressOutput: true });
      const after = Date.now();
      // Assert
      const duration = after - before;
      expect(duration)
          .toBeGreaterThanOrEqual(100);
      expect(result.exitCode)
          .toBeNull();
      expect(sut.isError(result))
          .toBeFalse();
      expect(sut.isResult(result))
          .toBeTrue();
    });
  });

});
