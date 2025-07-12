const ElevenLabs = require("elevenlabs-node"); // or appropriate import

const ALLOWED_ORIGIN = "https://www.nestedwisdom.com";

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
      body: "Invalid request body",
    };
  }

  const { character, text } = body;
  if (!character || !text) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: "Missing character or text",
    };
  }

  try {
    // Your real ElevenLabs logic here (use ElevenLabs SDK or direct fetch)
    const elevenLabsAudio = "BASE64_AUDIO"; // <-- replace with real call

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Content-Type": "text/plain",
      },
      body: elevenLabsAudio,
    };
  } catch (err) {
    console.error("Voice synthesis failed", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: "Voice synthesis error",
    };
  }
};
