import "expect-even-more-jest";
import * as http from "http";
import { AddressInfo } from "net";

// http-client relies on behaviour of @cypress/request which its documentation doesn't promise.
// These tests pin that behaviour, so that a breaking upgrade is reported here, with a pointer to
// the cause, rather than as a puzzling failure of a download.
describe(`@cypress/request behaviour which http-client relies on`, () => {
  const request = require("@cypress/request");
  const servers: http.Server[] = [];

  afterEach(async () => {
    await Promise.all(servers.splice(0).map(s => new Promise<void>(resolve => {
      s.closeAllConnections();
      s.close(() => resolve());
    })));
  });

  async function serve(handler: http.RequestListener): Promise<string> {
    const server = http.createServer(handler);
    servers.push(server);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    return `http://127.0.0.1:${ (server.address() as AddressInfo).port }`;
  }

  function upstreamBreakageHint(detail: string) {
    return `${ detail }\n` +
      `HINT: this probably means @cypress/request changed upstream. http-client's ` +
      `refuseDowngradeToHttp (gulp-tasks/modules/http-client.ts) depends on it: read the ` +
      `@cypress/request changelog, then adjust http-client rather than this test.`;
  }

  it(`should call a followRedirect function with the redirecting request as 'this'`, async () => {
    // Arrange
    const
      target = await serve((req, res) => res.end("arrived")),
      origin = await serve((req, res) => {
        res.statusCode = 302;
        res.setHeader("location", `${ target }/new`);
        res.end();
      });
    // read inside the callback: the request is updated to the redirect target afterwards
    let seen: { href: unknown, protocol: unknown, statusCode: number, location: string } | undefined;
    // Act
    await new Promise<void>((resolve, reject) => {
      request.get(`${ origin }/old`, {
        followRedirect: function (this: any, response: any) {
          seen = {
            href: this?.uri?.href,
            protocol: this?.uri?.protocol,
            statusCode: response.statusCode,
            location: response.headers.location
          };
          return true;
        }
      }, (err: Error | null) => err ? reject(err) : resolve());
    });
    // Assert
    if (typeof seen?.href !== "string" || typeof seen?.protocol !== "string") {
      throw new Error(upstreamBreakageHint(
        `expected 'this' in followRedirect to be the request, with uri.href and uri.protocol strings`
      ));
    }
    expect(seen.href)
      .toEqual(`${ origin }/old`);
    expect(seen.protocol)
      .toEqual("http:");
    expect(seen.statusCode)
      .toEqual(302);
    expect(seen.location)
      .toEqual(`${ target }/new`);
  });

  it(`should stop at the redirect, not follow it, when followRedirect returns false`, async () => {
    // Arrange
    let reached = 0;
    const
      target = await serve((req, res) => {
        reached++;
        res.end("arrived");
      }),
      origin = await serve((req, res) => {
        res.statusCode = 302;
        res.setHeader("location", `${ target }/new`);
        res.end();
      });
    // Act
    const statusCode = await new Promise<number>((resolve, reject) => {
      request.get(`${ origin }/old`, { followRedirect: () => false },
        (err: Error | null, response: any) => err ? reject(err) : resolve(response.statusCode));
    });
    // Assert
    if (reached !== 0 || statusCode !== 302) {
      throw new Error(upstreamBreakageHint(
        `expected a followRedirect function returning false to leave the 302 unfollowed (got status ${ statusCode }, ${ reached } hits on the target)`
      ));
    }
  });
});
