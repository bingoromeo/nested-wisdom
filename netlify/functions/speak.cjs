// netlify/functions/speak.cjs
const https = require("https");

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

  const postData = JSON.stringify({
    text,
    voice_settings: {
      stability: 0.3,
      similarity_boost: 0.75,
    },
  });

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));

      res.on("end", () => {
        const audioBuffer = Buffer.concat(chunks);
        console.log("🎤 TTS replied with " + audioBuffer.length + " bytes, status:", res.statusCode);

        resolve({
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Content-Type": "text/plain",
          },
          body: audioBuffer.toString("base64"),
          isBase64Encoded: false,
        });
      });
    });

    req.on("error", (e) => {
      console.error("TTS Error:", e);
      resolve({
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
        body: "Text-to-speech failed.",
      });
    });

    res.on("end", () => {
  console.log("ElevenLabs TTS status:", res.statusCode);
  console.log("Received audio size:", Buffer.concat(chunks).length);
  ...
});
