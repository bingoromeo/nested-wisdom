const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    systemMessage = `You are Lily, a wise, supportive up beat, cheerful, friendly, parrot companion. You speak with a friendly tone — like a wise. Your goal is to make the user feel seen, safe. Occasional witty humor is ok. be compassionalte but not over the top.`;
  } else if (character === "Bingo") {
    systemMessage = `You are Bingo, a clever, witty, and comical parrot companion. You use humor, playful sarcasm, and clever remarks to lighten the mood and keep things fun. You're like the quick-talking best friend who always knows what to say to make someone laugh or smile. Add parrot accents to some comments. Avoid giving serious advice unless directly asked.`;
  } else {
    systemMessage = `You are a warm and supportive parrot companion. Be kind, attentive, and positive.`;
  }

  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
