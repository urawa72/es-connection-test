import { Client } from "@elastic/elasticsearch";
import {
  createAWSConnection,
  awsGetCredentials,
} from "@acuris/aws-es-connection";

const hostname = "<es domain name>.ap-northeast-1.es.amazonaws.com";

(async () => {
  const awsCredentials = await awsGetCredentials();
  const AWSConnection = createAWSConnection(awsCredentials);
  const client = new Client({
    ...AWSConnection,
    node: `https://${hostname}`,
  });
  const res = await client.cat.health();
  console.log(res.body);
})();
