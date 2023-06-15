import "expect-even-more-jest";
import * as through from "through2";
import PluginError from "plugin-error";
import { faker } from "@faker-js/faker";
const { streamify } = requireModule<Streamify>("streamify");
const spawn = requireModule<Spawn>("spawn");
const { Sandbox } = require("filesystem-sandbox");
const gulp = requireModule<Gulp>("gulp");
import * as vinyl from "vinyl";

describe(`streamify-async-function`, () => {
  interface FooOpts {
    target: string;
    flag?: boolean;
  }

  const captured = {} as any;

  async function foo(opts: FooOpts): Promise<void> {
    captured.opts = opts;
  }

  it(`should provide a new function taking the same arguments, which can be streamed`, async () => {
    // Arrange
    const sandbox = await Sandbox.create();
    const txtFile = await sandbox.writeFile("foo.txt", "moo-cow");
    // Act
    await new Promise<void>(resolve => {
      gulp.src(`${ sandbox.path }/**/*.txt`)
        .pipe(streamify(
            foo,
            (f: vinyl.BufferFile) => {
              return { target: f.path, flag: true }
            },
            "test plugin",
            "foo"
          )
        ).pipe(
        through.obj(function() {
            resolve();
          }
        )
      );
    });
    // Assert
    expect(captured.opts.target)
      .toEqual(txtFile)
  });

  it(`should surface outputs when a SpawnError is caught`, async () => {
    // Arrange
    spyOn(console, "log");
    spyOn(console, "error");
    const sandbox = await Sandbox.create();
    await sandbox.writeFile("foo.txt", "moo-cow");
    const regularMessage = faker.word.words(5);
    const errorMessage = faker.word.words(5);
    const errorJs = await sandbox.writeFile("error.js", `
    console.log("${regularMessage}");
    throw new Error("${errorMessage}");
    `)
    let captured: any;
    // Act
    await new Promise<void>(resolve => {
      gulp.src(`${ sandbox.path }/**/*.txt`)
        .pipe(
          streamify(
            (opts: FooOpts) => Promise.resolve(),
            async (f: vinyl.BufferFile) => {
              await spawn(
                "node", [ errorJs ]
              );
              // shouldn't get here...
              return {} as FooOpts;
            },
            "test plugin",
            "foo"
          )
        ).on("error", e => {
          captured = e;
          resolve();
      })
    });
    // Assert
    expect(captured)
      .toExist();
    expect(captured)
      .toBeA(PluginError);
    expect(captured.message)
      .toContain(errorMessage);
    expect(captured.message)
      .toContain(regularMessage);
  });

  beforeEach(() => {
    for (const k of Object.keys(captured)) {
      delete captured[k];
    }
  });
  afterEach(async () => {
    await Sandbox.destroyAll();
  });
});
