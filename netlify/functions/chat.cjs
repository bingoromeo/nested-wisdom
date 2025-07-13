// netlify/functions/chat.cjs
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_ORIGIN = "*"; // or set to "https://www.nestedwisdom.com"

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
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
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ reply: "Invalid request body." }),
    };
  }

  const { character, message } = body;
  if (!character || !message) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ reply: "Missing character or message." }),
    };
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are ${character}, a wise and witty parrot who speaks to users.`,
        },
        { role: "user", content: message },
      ],
    });

    const reply = chatCompletion.choices[0].message.content.trim();

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("OpenAI error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ reply: "AI error occurred." }),
    };
  }
};
