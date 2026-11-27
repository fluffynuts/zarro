"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTlsFixture = createTlsFixture;
const selfsigned_1 = require("selfsigned");
// generated per run so that no private key is committed; protects nothing
async function createTlsFixture() {
    const pems = await (0, selfsigned_1.generate)([{ name: "commonName", value: "localhost" }], {
        keySize: 2048,
        algorithm: "sha256",
        extensions: [
            {
                name: "subjectAltName",
                altNames: [
                    { type: 2, value: "localhost" },
                    { type: 7, ip: "127.0.0.1" }
                ]
            }
        ]
    });
    return { key: pems.private, cert: pems.cert };
}
