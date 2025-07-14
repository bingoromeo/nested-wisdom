const https = require("https");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

const voiceMap = {
  Lily: "pjcYQlDFKMbcOUp6F5GD",
  Bingo: "v9LgF91V36LGgbLX3iHW"
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: "Method Not Allowed"
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: "Invalid JSON"
    };
  }

  const { character, text } = body;
  const voiceId = voiceMap[character];
  if (!voiceId || !text) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: "Missing character or text"
    };
  }

  const speed = character === "Lily" ? 1.1 : 1.1;

  const elevenLabsOptions = {
    hostname: "api.elevenlabs.io",
    path: `/v1/text-to-speech/${voiceId}`,
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg"
    }
  };

  const postData = JSON.stringify({
    text,
    voice_settings: {
      stability: 0.3,
      similarity_boost: 0.75
    },
    speed: speed
  });

  return new Promise((resolve) => {
    const req = https.request(elevenLabsOptions, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", async () => {
        const audioBuffer = Buffer.concat(chunks);
        const s3 = new S3Client({
          region: "auto",
          endpoint: R2_ENDPOINT,
          credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY
          }
        });

        const fileName = `${character.toLowerCase()}-${uuidv4()}.mp3`;
        const uploadParams = {
          Bucket: R2_BUCKET,
          Key: fileName,
          Body: audioBuffer,
          ContentType: "audio/mpeg"
        };

        try {
          await s3.send(new PutObjectCommand(uploadParams));
          const fileUrl = `${R2_ENDPOINT}/${R2_BUCKET}/${fileName}`;
          resolve({
            statusCode: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: fileUrl })
          });
        } catch (err) {
          console.error("R2 upload failed:", err);
          resolve({
            statusCode: 500,
            headers: corsHeaders,
            body: "Upload to R2 failed"
          });
        }
      });
    });

    req.on("error", (e) => {
      console.error("TTS request error:", e);
      resolve({
        statusCode: 500,
        headers: corsHeaders,
        body: "TTS failed"
      });
    });

    req.write(postData);
    req.end();
  });
};
