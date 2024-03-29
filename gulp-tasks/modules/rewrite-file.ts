(function () {
  const
    es = require("event-stream"),
    ZarroError = requireModule<ZarroError>("zarro-error"),
    fs = requireModule<FileSystemUtils>("fs");

  function rewriteFile(transform?: ((s: Buffer) => Buffer)) {
    return es.through(
      function write(this: any, file: any) {
        const fileName = file.history[0];
        if (!fileName || !fs.existsSync(fileName)) {
          throw new ZarroError(`Cannot rewrite ${fileName || "(no file name)"}`);
        }
        let contents = file._contents;
        if (!contents) {
          throw new ZarroError(`Cannot read contents of ${fileName}`);
        }
        if (transform) {
          contents = transform(contents);
        }
        fs.writeFileSync(fileName, contents);
        this.emit("data", file);
      },
      async function end(this: any) {
        this.emit("end");
      }
    );
  }

  module.exports = {
    rewriteFile
  };
})();

