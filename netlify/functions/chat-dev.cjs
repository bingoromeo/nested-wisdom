const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_DEV_KEY, // <-- Dev key instead of prod
});

const ALLOWED_ORIGIN = "https://www.nestedwisdom.com"; // or your dev domain

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
      body: JSON.stringify({ reply: "Invalid request body." }),
    };
  }

  const { character, message } = body;
  if (!character || !message) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: JSON.stringify({ reply: "Missing character or message." }),
    };
  }

  let systemMessage = "";
  if (character === "Lily") {
    systemMessage = `You are Lily, a wise, upbeat, cheerful, friendly, parrot companion...`;
  } else if (character === "Bingo") {
    systemMessage = `You are Willy, a clever, witty, and comical parrot companion...`;
  } else {
    systemMessage = `You are a warm and supportive parrot companion. Be kind, attentive, and positive.`;
  }

  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4", // Or "gpt-4-turbo" if desired for dev
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message },
      ],
    });

    const reply = chatResponse.choices[0].message.content.trim();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("OpenAI error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: JSON.stringify({ reply: "AI error occurred." }),
    };
  }
};
