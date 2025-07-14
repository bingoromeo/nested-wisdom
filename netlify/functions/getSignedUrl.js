// /netlify/functions/getSignedUrl.js
import aws from "aws-sdk";

const {
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_ENDPOINT,
  CF_ACCOUNT_ID,
} = process.env;

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const s3 = new aws.S3({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      endpoint: R2_ENDPOINT,
      signatureVersion: "v4",
      region: "auto",
    });

    const key = event.queryStringParameters?.key;

    if (!key) {
      return {
        statusCode: 400,
        body: "Missing 'key' query parameter.",
      };
    }

    const params = {
      Bucket: R2_BUCKET,
      Key: key,
      Expires: 3600, // 1 hour signed URL
    };

    const url = s3.getSignedUrl("getObject", params);

    return {
      statusCode: 200,
      body: JSON.stringify({ url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
