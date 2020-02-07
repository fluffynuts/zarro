const uuid = require("uuid/v4"),
  path = require("path"),
  mkdir = require("mkdirp").sync,
  rimraf = require("rimraf").sync,
  fs = require("fs"),
  writeFile = fs.promises.writeFile,
  readFile = fs.promises.readFile,
  basePrefix = "__sandboxes__";

class Sandbox {
  get path() {
    return this._path;
  }

  constructor(at) {
    this._path = path.join((at || process.cwd()), basePrefix, uuid());
    mkdir(this._path);
  }

  destroy(dir) {
    rimraf(dir);
  }

  async writeTextFile(at, contents) {
    const fullPath = this.fullPathFor(at);
    await writeFile(
      fullPath,
      contents, { encoding: "utf8" }
    );
    return fullPath;
  }

  async readTextFile(at) {
    return readFile(
      this.fullPathFor(at),
      { encoding: "utf8" }
    );
  }

  fullPathFor(relativePath) {
    return path.join(this._path, relativePath);
  }

}

Sandbox.destroyAll = async function () {
  await rimraf(path.join(basePrefix));
};

Sandbox.create = function (at) {
  return new Sandbox(at);
};

module.exports = Sandbox;
