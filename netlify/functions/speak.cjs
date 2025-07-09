// netlify/functions/speak.cjs
const https = require("https");
const { Readable } = require("stream");

const ALLOWED_ORIGIN = "https://www.nestedwisdom.com";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const voiceMap = {
  Lily: "pjcYQlDFKMbcOUp6F5GD",
  Bingo: "v9LgF91V36LGgbLX3iHW",
};

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: "Method Not Allowed",
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: JSON.stringify({ error: "Invalid request body." }),
    };
  }

  const { character, text } = body;
  const voiceId = voiceMap[character];

  if (!voiceId || !text) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: JSON.stringify({ error: "Missing character or text." }),
    };
  }

  const options = {
    hostname: "api.elevenlabs.io",
    path: `/v1/text-to-speech/${voiceId}`,
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
  };

  const postData = JSON.stringify({ text });

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const audioBuffer = Buffer.concat(chunks);
        resolve({
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Content-Type": "audio/mpeg",
          },
          body: audioBuffer.toString("base64"),
          isBase64Encoded: true,
        });
      });
    });

    req.on("error", (e) => {
      console.error("TTS Error:", e);
      resolve({
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
        body: JSON.stringify({ error: "Text-to-speech failed." }),
      });
    });

    req.write(postData);
    req.end();
  });
};
