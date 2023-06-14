import "expect-even-more-jest";
import * as through from "through2";
const { streamify } = requireModule<Streamify>("streamify");

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
    await sandbox.writeFile("foo.txt", "moo-cow");
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
      .toEqual(sandbox.fullPathFor("foo.txt"));
  });

  afterEach(async () => {
    await Sandbox.destroyAll();
  });
});
