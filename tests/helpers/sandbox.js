const uuid = require("uuid/v4"),
  path = require("path"),
  mkdir = require("mkdirp").sync,
  rimraf = require("rimraf").sync,
  fs = require("fs"),
  writeFile = fs.writeFileSync,
  readFile = fs.readFileSync,
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

  writeTextFile(at, contents) {
    return writeFile(
      this.fullPathFor(at),
      contents, { encoding: "utf8" }
    );
  }

  readTextFile(at) {
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
