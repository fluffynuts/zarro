import { generate } from "selfsigned";

export interface TlsFixture {
  key: string;
  cert: string;
}

// generated per run so that no private key is committed; protects nothing
export async function createTlsFixture(): Promise<TlsFixture> {
  const pems = await generate(
    [ { name: "commonName", value: "localhost" } ],
    {
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
    }
  );
  return { key: pems.private, cert: pems.cert };
}
