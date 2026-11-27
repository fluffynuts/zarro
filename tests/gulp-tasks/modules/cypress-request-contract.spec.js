"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const http = __importStar(require("http"));
// http-client relies on behaviour of @cypress/request which its documentation doesn't promise.
// These tests pin that behaviour, so that a breaking upgrade is reported here, with a pointer to
// the cause, rather than as a puzzling failure of a download.
describe(`@cypress/request behaviour which http-client relies on`, () => {
    const request = require("@cypress/request");
    const servers = [];
    afterEach(async () => {
        await Promise.all(servers.splice(0).map(s => new Promise(resolve => {
            s.closeAllConnections();
            s.close(() => resolve());
        })));
    });
    async function serve(handler) {
        const server = http.createServer(handler);
        servers.push(server);
        await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
        return `http://127.0.0.1:${server.address().port}`;
    }
    function upstreamBreakageHint(detail) {
        return `${detail}\n` +
            `HINT: this probably means @cypress/request changed upstream. http-client's ` +
            `refuseDowngradeToHttp (gulp-tasks/modules/http-client.ts) depends on it: read the ` +
            `@cypress/request changelog, then adjust http-client rather than this test.`;
    }
    it(`should call a followRedirect function with the redirecting request as 'this'`, async () => {
        // Arrange
        const target = await serve((req, res) => res.end("arrived")), origin = await serve((req, res) => {
            res.statusCode = 302;
            res.setHeader("location", `${target}/new`);
            res.end();
        });
        // read inside the callback: the request is updated to the redirect target afterwards
        let seen;
        // Act
        await new Promise((resolve, reject) => {
            request.get(`${origin}/old`, {
                followRedirect: function (response) {
                    var _a, _b;
                    seen = {
                        href: (_a = this === null || this === void 0 ? void 0 : this.uri) === null || _a === void 0 ? void 0 : _a.href,
                        protocol: (_b = this === null || this === void 0 ? void 0 : this.uri) === null || _b === void 0 ? void 0 : _b.protocol,
                        statusCode: response.statusCode,
                        location: response.headers.location
                    };
                    return true;
                }
            }, (err) => err ? reject(err) : resolve());
        });
        // Assert
        if (typeof (seen === null || seen === void 0 ? void 0 : seen.href) !== "string" || typeof (seen === null || seen === void 0 ? void 0 : seen.protocol) !== "string") {
            throw new Error(upstreamBreakageHint(`expected 'this' in followRedirect to be the request, with uri.href and uri.protocol strings`));
        }
        expect(seen.href)
            .toEqual(`${origin}/old`);
        expect(seen.protocol)
            .toEqual("http:");
        expect(seen.statusCode)
            .toEqual(302);
        expect(seen.location)
            .toEqual(`${target}/new`);
    });
    it(`should stop at the redirect, not follow it, when followRedirect returns false`, async () => {
        // Arrange
        let reached = 0;
        const target = await serve((req, res) => {
            reached++;
            res.end("arrived");
        }), origin = await serve((req, res) => {
            res.statusCode = 302;
            res.setHeader("location", `${target}/new`);
            res.end();
        });
        // Act
        const statusCode = await new Promise((resolve, reject) => {
            request.get(`${origin}/old`, { followRedirect: () => false }, (err, response) => err ? reject(err) : resolve(response.statusCode));
        });
        // Assert
        if (reached !== 0 || statusCode !== 302) {
            throw new Error(upstreamBreakageHint(`expected a followRedirect function returning false to leave the 302 unfollowed (got status ${statusCode}, ${reached} hits on the target)`));
        }
    });
});
