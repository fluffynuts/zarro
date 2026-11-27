import "expect-even-more-jest";
import * as http from "http";
import * as https from "https";
import * as tls from "tls";
import { AddressInfo } from "net";
import { Sandbox } from "filesystem-sandbox";
import { fileExists, readTextFile } from "yafs";
import { tlsFixture } from "../../test-helpers/tls-fixture";

describe(`http-client`, () => {
  const HttpClient = requireModule<HttpClientModule>("http-client");
  const proxyEnvVars = [
    "HTTP_PROXY", "http_proxy", "HTTPS_PROXY", "https_proxy",
    "ALL_PROXY", "all_proxy", "NO_PROXY", "no_proxy",
    "SUPPRESS_DOWNLOAD_PROGRESS", "BUILD_NUMBER"
  ];
  const savedEnv: Record<string, string | undefined> = {};
  const defaultCaCertificates = tls.getCACertificates("default");
  const servers: Array<http.Server | https.Server> = [];

  beforeEach(() => {
    // deterministic whatever the host's proxy configuration is
    for (const name of proxyEnvVars) {
      savedEnv[name] = process.env[name];
      delete process.env[name];
    }
  });

  afterEach(async () => {
    tls.setDefaultCACertificates(defaultCaCertificates);
    for (const name of proxyEnvVars) {
      if (savedEnv[name] === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = savedEnv[name];
      }
    }
    await Promise.all(servers.splice(0).map(s => new Promise<void>(resolve => {
      s.closeAllConnections();
      s.close(() => resolve());
    })));
  });

  afterAll(async () => {
    await Sandbox.destroyAll();
  });

  async function serve(
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void
  ): Promise<string> {
    const server = http.createServer(handler);
    servers.push(server);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    return `http://127.0.0.1:${ (server.address() as AddressInfo).port }`;
  }

  async function serveTls(
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void
  ): Promise<string> {
    // the fixture certificate is self-signed: trust it rather than disabling verification
    tls.setDefaultCACertificates([ ...defaultCaCertificates, tlsFixture.cert ]);
    const server = https.createServer(tlsFixture, handler);
    servers.push(server);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    return `https://127.0.0.1:${ (server.address() as AddressInfo).port }`;
  }

  function create() {
    // silence the info and debug logging
    return HttpClient.create(() => {
    }, () => {
    });
  }

  describe(`download`, () => {
    it(`should save the body to the target and return the target`, async () => {
      // Arrange
      const
        base = await serve((req, res) => {
          res.setHeader("content-length", "11");
          res.end("hello world");
        }),
        sandbox = await Sandbox.create(),
        target = sandbox.fullPathFor("downloaded.txt"),
        sut = create();
      // Act
      const result = await sut.download(`${ base }/file`, target);
      // Assert
      expect(result)
        .toEqual(target);
      expect(await readTextFile(target))
        .toEqual("hello world");
    });

    it(`should not leave the .part file behind`, async () => {
      // Arrange
      const
        base = await serve((req, res) => res.end("data")),
        sandbox = await Sandbox.create(),
        target = sandbox.fullPathFor("downloaded.txt"),
        sut = create();
      // Act
      await sut.download(`${ base }/file`, target);
      // Assert
      expect(await fileExists(`${ target }.part`))
        .toBeFalse();
    });

    it(`should create the target's folder when it does not exist`, async () => {
      // Arrange
      const
        base = await serve((req, res) => res.end("data")),
        sandbox = await Sandbox.create(),
        target = sandbox.fullPathFor("deeply/nested/folder/downloaded.txt"),
        sut = create();
      // Act
      await sut.download(`${ base }/file`, target);
      // Assert
      expect(await readTextFile(target))
        .toEqual("data");
    });

    it(`should follow redirects`, async () => {
      // Arrange
      const
        base = await serve((req, res) => {
          if (req.url === "/old") {
            res.statusCode = 302;
            res.setHeader("location", "/new");
            res.end();
            return;
          }
          res.end("the new content");
        }),
        sandbox = await Sandbox.create(),
        target = sandbox.fullPathFor("downloaded.txt"),
        sut = create();
      // Act
      await sut.download(`${ base }/old`, target);
      // Assert
      expect(await readTextFile(target))
        .toEqual("the new content");
    });

    it(`should follow a redirect from http up to https`, async () => {
      // Arrange
      const
        secure = await serveTls((req, res) => res.end("served over tls")),
        insecure = await serve((req, res) => {
          res.statusCode = 302;
          res.setHeader("location", `${ secure }/file`);
          res.end();
        }),
        sandbox = await Sandbox.create(),
        target = sandbox.fullPathFor("downloaded.txt"),
        sut = create();
      // Act
      await sut.download(`${ insecure }/file`, target);
      // Assert
      expect(await readTextFile(target))
        .toEqual("served over tls");
    });

    it(`should not follow a redirect from https down to http`, async () => {
      // Arrange
      let insecureRequests = 0;
      const
        insecure = await serve((req, res) => {
          insecureRequests++;
          res.end("served in the clear");
        }),
        secure = await serveTls((req, res) => {
          res.statusCode = 302;
          res.setHeader("location", `${ insecure }/file`);
          res.end();
        }),
        sandbox = await Sandbox.create(),
        target = sandbox.fullPathFor("downloaded.txt"),
        sut = create();
      // Act
      await sut.download(`${ secure }/file`, target).catch(() => {
      });
      // Assert
      expect(insecureRequests)
        .toEqual(0);
    });

    it(`should reject when the server can't be reached`, async () => {
      // Arrange
      const
        // a port which was in use a moment ago and is now closed
        closed = await serve((req, res) => res.end()),
        sandbox = await Sandbox.create(),
        target = sandbox.fullPathFor("downloaded.txt"),
        sut = create();
      await Promise.all(servers.splice(0).map(s => new Promise<void>(resolve => s.close(() => resolve()))));
      // Act
      await expect(sut.download(`${ closed }/file`, target))
        .rejects.toBeDefined();
      // Assert
      expect(await fileExists(target))
        .toBeFalse();
    });

    it(`should go through the proxy named in the environment`, async () => {
      // Arrange
      const
        target = await serve((req, res) => res.end("via the proxy")),
        seenByProxy: string[] = [],
        proxy = await serve((req, res) => {
          // a forward proxy is sent the absolute url
          seenByProxy.push(req.url as string);
          const forward = http.request(req.url as string, { method: req.method }, upstream => {
            res.writeHead(upstream.statusCode as number, upstream.headers);
            upstream.pipe(res);
          });
          req.pipe(forward);
        }),
        sandbox = await Sandbox.create(),
        destination = sandbox.fullPathFor("downloaded.txt"),
        sut = create();
      process.env.HTTP_PROXY = proxy;
      // Act
      await sut.download(`${ target }/file`, destination);
      // Assert
      expect(seenByProxy)
        .toEqual([ `${ target }/file` ]);
      expect(await readTextFile(destination))
        .toEqual("via the proxy");
    });

    it(`should bypass the proxy for hosts in NO_PROXY`, async () => {
      // Arrange
      const
        target = await serve((req, res) => res.end("direct")),
        seenByProxy: string[] = [],
        proxy = await serve((req, res) => {
          seenByProxy.push(req.url as string);
          res.statusCode = 500;
          res.end();
        }),
        sandbox = await Sandbox.create(),
        destination = sandbox.fullPathFor("downloaded.txt"),
        sut = create();
      process.env.HTTP_PROXY = proxy;
      process.env.NO_PROXY = "127.0.0.1";
      // Act
      await sut.download(`${ target }/file`, destination);
      // Assert
      expect(seenByProxy)
        .toEqual([]);
      expect(await readTextFile(destination))
        .toEqual("direct");
    });

    describe(`progress`, () => {
      const body = Buffer.alloc(300 * 1024, "x");

      async function serveBody() {
        return serve((req, res) => {
          res.setHeader("content-length", `${ body.length }`);
          // in pieces, so that there is progress to report
          const pieceSize = 50 * 1024;
          let sent = 0;
          const sendNext = () => {
            if (sent >= body.length) {
              return res.end();
            }
            res.write(body.subarray(sent, sent + pieceSize));
            sent += pieceSize;
            setImmediate(sendNext);
          };
          sendNext();
        });
      }

      function captureStdout() {
        const written: string[] = [];
        const spy = jest.spyOn(process.stdout, "write").mockImplementation((chunk: any) => {
          written.push(`${ chunk }`);
          return true;
        });
        return { written, restore: () => spy.mockRestore() };
      }

      it(`should report a percentage on stdout`, async () => {
        // Arrange
        const
          base = await serveBody(),
          sandbox = await Sandbox.create(),
          target = sandbox.fullPathFor("downloaded.bin"),
          sut = create(),
          capture = captureStdout();
        // Act
        try {
          await sut.download(`${ base }/file`, target);
        } finally {
          capture.restore();
        }
        // Assert
        expect(capture.written.some(s => /\d+% of /.test(s)))
          .toBeTrue();
      });

      it(`should report nothing when suppressProgress is set`, async () => {
        // Arrange
        const
          base = await serveBody(),
          sandbox = await Sandbox.create(),
          target = sandbox.fullPathFor("downloaded.bin"),
          sut = create(),
          capture = captureStdout();
        sut.suppressProgress = true;
        // Act
        try {
          await sut.download(`${ base }/file`, target);
        } finally {
          capture.restore();
        }
        // Assert
        expect(capture.written.some(s => /\d+% of /.test(s)))
          .toBeFalse();
      });

      it(`should report nothing when SUPPRESS_DOWNLOAD_PROGRESS is set`, async () => {
        // Arrange
        const
          base = await serveBody(),
          sandbox = await Sandbox.create(),
          target = sandbox.fullPathFor("downloaded.bin"),
          sut = create(),
          capture = captureStdout();
        process.env.SUPPRESS_DOWNLOAD_PROGRESS = "1";
        // Act
        try {
          await sut.download(`${ base }/file`, target);
        } finally {
          capture.restore();
        }
        // Assert
        expect(capture.written.some(s => /\d+% of /.test(s)))
          .toBeFalse();
      });
    });
  });

  describe(`exists`, () => {
    it(`should resolve true for a url which can be reached`, async () => {
      // Arrange
      const
        base = await serve((req, res) => res.end("here")),
        sut = create();
      // Act
      const result = await sut.exists(`${ base }/file`);
      // Assert
      expect(result)
        .toBeTrue();
    });

    it(`should resolve true for a url which redirects from http up to https`, async () => {
      // Arrange
      const
        secure = await serveTls((req, res) => res.end("here")),
        insecure = await serve((req, res) => {
          res.statusCode = 302;
          res.setHeader("location", `${ secure }/file`);
          res.end();
        }),
        sut = create();
      // Act
      const result = await sut.exists(`${ insecure }/file`);
      // Assert
      expect(result)
        .toBeTrue();
    });

    it(`should resolve false when the server can't be reached`, async () => {
      // Arrange
      const
        closed = await serve((req, res) => res.end()),
        sut = create();
      await Promise.all(servers.splice(0).map(s => new Promise<void>(resolve => s.close(() => resolve()))));
      // Act
      const result = await sut.exists(`${ closed }/file`);
      // Assert
      expect(result)
        .toBeFalse();
    });
  });
});
