// netlify/functions/speak.cjs
const https = require("https");

const ALLOWED_ORIGIN = "*";
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
      body: "Invalid JSON.",
    };
  }

  const { character, text } = body;
  const voiceId = voiceMap[character];
  if (!voiceId || !text) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: "Missing character or text.",
    };
  }

  const postData = JSON.stringify({
    text,
    model_id: "eleven_monolingual_v1",
    voice_settings: { stability: 0.3, similarity_boost: 0.75 },
  });

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

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const audioBuffer = Buffer.concat(chunks);
        const base64Audio = audioBuffer.toString("base64");
        resolve({
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Content-Type": "text/plain",
          },
          body: base64Audio,
          isBase64Encoded: true, // ✅ required for binary audio playback!
        });
      });
    });

    req.on("error", (e) => {
      console.error("ElevenLabs TTS error:", e);
      resolve({
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
        body: "Text-to-speech failed.",
      });
    });

    req.write(postData);
    req.end();
  });
};
