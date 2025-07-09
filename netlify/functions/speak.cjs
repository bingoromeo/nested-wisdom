// netlify/functions/speak.cjs
const https = require("https");

const VOICES = {
  Lily: "pjcYQlDFKMbcOUp6F5GD",
  Bingo: "v9LgF91V36LGgbLX3iHW",
};

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const { character, text } = body;
  const voice_id = VOICES[character];
  if (!voice_id || !text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing character or text" }),
    };
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;

  const payload = JSON.stringify({
    text,
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  const options = {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const base64Audio = buffer.toString("base64");

        resolve({
          statusCode: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Access-Control-Allow-Origin": "*",
          },
          body: base64Audio,
          isBase64Encoded: true,
        });
      });
    });

    req.on("error", (e) => {
      console.error("Error:", e);
      reject({
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to generate speech" }),
      });
    });

    req.write(payload);
    req.end();
  });
};
