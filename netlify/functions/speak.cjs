const https = require("https");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const voiceMap = {
  Lily: "pjcYQlDFKMbcOUp6F5GD",
  Bingo: "v9LgF91V36LGgbLX3iHW",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: "Method Not Allowed",
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: "Invalid JSON",
    };
  }

  const { character, text } = body;
  const voiceId = voiceMap[character];

  if (!voiceId || !text) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: "Missing character or text",
    };
  }

  // 🎯 Personality-based speed settings
  const speed = character === "Lily" ? 1.0 : 1.1;

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
    speed: speed
  });

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const audioBuffer = Buffer.concat(chunks);
        resolve({
          statusCode: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "text/plain",
          },
          body: audioBuffer.toString("base64"),
        });
      });
    });

    req.on("error", (e) => {
      console.error("TTS error:", e);
      resolve({
        statusCode: 500,
        headers: corsHeaders,
        body: "Text-to-speech failed.",
      });
    });

    req.write(postData);
    req.end();
  });
};
