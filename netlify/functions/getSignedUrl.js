const { Signer } = require('@aws-sdk/s3-request-presigner');
const {
  S3Client,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-provider-env');

const REGION = 'auto'; // Always "auto" for Cloudflare R2
const BUCKET = 'nested-wisdom-videos';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  const { fileName } = JSON.parse(event.body || '{}');

  if (!fileName) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: "Missing file name",
    };
  }

  try {
    const s3 = new S3Client({
      region: REGION,
      endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: fromEnv(),
    });

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: fileName,
    });

    const signer = new Signer({ client: s3, command });
    const signedUrl = await signer.presign(command, { expiresIn: 60 }); // valid for 60 seconds

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (error) {
    console.error("Signed URL error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: "Failed to generate signed URL",
    };
  }
};
