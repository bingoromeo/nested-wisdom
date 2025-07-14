const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REGION = "auto"; // Cloudflare R2 always uses "auto"
const BUCKET = process.env.R2_BUCKET_NAME;

const client = new S3Client({
  region: REGION,
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY
  }
});

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: "Invalid JSON"
    };
  }

  const { fileName } = body;

  if (!fileName) {
    return {
      statusCode: 400,
      body: "Missing fileName"
    };
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: fileName
  });

  try {
    const url = await getSignedUrl(client, command, { expiresIn: 3600 }); // 1 hour
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    };
  } catch (err) {
    console.error("Error creating signed URL:", err);
    return {
      statusCode: 500,
      body: "Failed to generate signed URL"
    };
  }
};
