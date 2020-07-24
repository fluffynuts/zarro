import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import path from "path";
import { runInFolder } from "../../test-helpers/run-in-folder";

const
  readGitInfo = requireModule<ReadGitInfo>("read-git-info"),
  exec = requireModule<Exec>("exec"),
  writeTextFile = requireModule<WriteTextFile>("write-text-file"),
  readTextFile = requireModule<ReadTextFile>("read-text-file");

describe(`read-git-info`, () => {
  if (process.env.RUNNING_IN_GITHUB_ACTION) {
    return it.skip(`- tests don't work well @ GH`, () => {
    });
  }
  it(`should export a function`, async () => {
    // Arrange
    // Act
    expect(readGitInfo)
      .toBeFunction();
    // Assert
  });

  describe(`when working with git repo`, () => {
    it(`should return git info`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create();
      await createRepo(sandbox.path);
      await addRemote(sandbox.path, "origin", "https://github.com/user/repo");
      await commitFile(sandbox.path, "README.md", "this is a test");
      await addBranch(sandbox.path, "branch1");
      await addBranch(sandbox.path, "branch2");
      await checkout(sandbox.path, "master");
      // Act
      const result = await readGitInfo(sandbox.path);
      // Assert
      expect(result.isGitRepository)
        .toBeTrue();
      expect(result.branches)
        .toBeArray();
      expect(result.branches.sort())
        .toEqual(["branch1", "branch2", "master"]);
      expect(result.currentBranch)
        .toEqual("master");
    });
  });

  describe(`when working in !repo`, () => {
    it(`should return info for !repo`, async () => {
      // Arrange
      spyOn(console, "error");
      const sandbox = await Sandbox.create();
      // Act
      const result = await readGitInfo(sandbox.path);
      // Assert
      expect(result)
        .toExist();
      expect(result.isGitRepository)
        .toBeFalse();
      expect(result.primaryRemote)
        .toBeUndefined();
      expect(result.currentBranch)
        .toBeUndefined();
      expect(result.remotes)
        .toBeEmptyArray();
      expect(result.branches)
        .toBeEmptyArray();
    });
  });

  describe(`when working in git repo with no remote`, () => {
    describe(`when no commits`, () => {
      it(`should return git info with no branch`, async () => {
        // Arrange
        const
          sandbox = await Sandbox.create();
        await createRepo(sandbox.path);
        // Act
        const result = await readGitInfo(sandbox.path);
        // Assert
        expect(result)
          .toExist();
        expect(result.isGitRepository)
          .toBeTrue();
        expect(result.primaryRemote)
          .toBeUndefined();
        expect(result.currentBranch)
          .toBeUndefined();
        expect(result.remotes)
          .toBeEmptyArray();
        expect(result.branches)
          .toBeEmptyArray();
      });
    });

    describe(`when have single commit`, () => {
      it(`should return git info with branch`, async () => {
        // Arrange
        const
          sandbox = await Sandbox.create();
        await createRepo(sandbox.path);
        await commitFile(sandbox.path, "README.md", "test");
        // Act
        const result = await readGitInfo(sandbox.path);
        // Assert
        expect(result)
          .toExist();
        expect(result.isGitRepository)
          .toBeTrue();
        expect(result.primaryRemote)
          .toBeUndefined();
        expect(result.currentBranch)
          .toEqual("master");
        expect(result.remotes)
          .toBeEmptyArray();
        expect(result.branches)
          .toEqual(["master"]);
      });
    });
  });

  beforeEach(() => {
    jest.setTimeout(10000); // fs-ops may take a while ?
    exec.alwaysSuppressOutput = true;
  });

  afterAll(async () => await Sandbox.destroyAll());

  async function createRepo(at: string) {
    return runInFolder(at, () => exec("git", ["init"]));
  }


  async function addRemote(at: string, name: string, url: string) {
    return runInFolder(at,
      () => exec("git", ["remote", "add", name, url])
    );
  }

  async function commitFile(at: string, name: string, contents: string | ((current: string) => string)) {
    return runInFolder(at,
      async () => {
        const fpath = path.join(at, name);
        if (typeof contents === "function") {
          const current = await readTextFile(fpath);
          const updated = contents(current);
          await writeTextFile(fpath, updated);
        } else {
          await writeTextFile(fpath, contents);
        }
        await commitAll(at, `test commit ${ Date.now() }`);
      });
  }

  async function commitAll(at: string, message: string) {
    return runInFolder(at,
      async () => {
        await exec("git", ["add", "-A", ":/"]);
        await exec("git", ["commit", "-am", `"${ message }"`]);
      })
  }

  async function checkout(at: string, branch: string, create?: boolean) {
    create = create ?? false;
    const args = [
      "checkout"
    ];
    if (create) {
      args.push("-b");
    }
    args.push(branch);
    return runInFolder(at,
      () => exec("git", args)
    );
  }

  async function addBranch(at: string, name: string) {
    // checkout -b
    await checkout(at, name, true);
    // modify readme
    await commitFile(at, "README.md", contents => contents + `\nmodified for: ${ name } at ${ new Date() }`);
    // commit
  }
});
