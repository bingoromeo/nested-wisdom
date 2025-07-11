// netlify/functions/chat.cjs
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Frontend domain (adjust to match your frontend)
const ALLOWED_ORIGIN = "https://www.nestedwisdom.com";

exports.handler = async function (event) {
  // Handle preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  // Main POST request handler
  try {
    const { character, message } = JSON.parse(event.body);

    if (!character || !message) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
        body: JSON.stringify({ error: "Missing character or message." }),
      };
    }

    const prompt = `${character} is talking to a child. Reply in character. Message: "${message}"`;

    const chatResponse = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const reply = chatResponse.choices[0].message.content;

    // Optional: Store message in Supabase (can be added later)

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
      body: JSON.stringify({ error: "Internal server error." }),
    };
  }
};
