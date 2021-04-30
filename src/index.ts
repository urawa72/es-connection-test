import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { IncomingMessage } from "http";

interface CreateSignHttpRequestParams {
  body?: string;
  headers?: Record<string, string>;
  hostname: string;
  method?: string;
  path?: string;
  port?: number;
  protocol?: string;
  query?: Record<string, string>;
  service: string;
}

export async function createSignedHttpRequest({
  headers,
  hostname,
  method = "GET",
  path = "/",
  port = 443,
  protocol = "https:",
  query,
  service,
}: CreateSignHttpRequestParams): Promise<HttpRequest> {
  const httpRequest = new HttpRequest({
    headers,
    hostname,
    method,
    path,
    port,
    protocol,
    query,
  });
  const sigV4Init = {
    credentials: defaultProvider(),
    region: "ap-northeast-1",
    service,
    sha256: Sha256,
  };
  const signer = new SignatureV4(sigV4Init);
  return signer.sign(httpRequest) as Promise<HttpRequest>;
}

const nodeHttpHandler = new NodeHttpHandler();

(async () => {
  const hostname = "<es domain name>.ap-northeast-1.es.amazonaws.com";

  const signedHttpRequest = await createSignedHttpRequest({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      host: hostname,
    },
    hostname,
    path: "_cat/health",
    service: "es",
  });
  console.log(signedHttpRequest);

  try {
    const res = await nodeHttpHandler.handle(signedHttpRequest);
    const body = await new Promise((resolve, reject) => {
      const incomingMessage = res.response.body as IncomingMessage;
      let body = "";
      incomingMessage.on("data", (chunk) => {
        body += chunk;
      });
      incomingMessage.on("end", () => {
        resolve(body);
      });
      incomingMessage.on("error", (err) => {
        reject(err);
      });
    });
    console.log(body);
  } catch (err) {
    console.error("Error:");
    console.error(err);
  }
})();
