// /netlify/functions/getSignedUrl.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const {
  CF_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_ENDPOINT,
} = process.env;

const client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const { fileName, contentType } = JSON.parse(event.body);

  if (!fileName || !contentType) {
    return {
      statusCode: 400,
      body: "Missing fileName or contentType",
    };
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fileName,
    ContentType: contentType,
  });

  try {
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    return {
      statusCode: 200,
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
