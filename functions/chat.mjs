// netlify/functions/chat.mjs
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://nestedwisdom.com",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "https://nestedwisdom.com",
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const { character, message } = JSON.parse(event.body || "{}");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are ${character}` },
        { role: "user", content: message },
      ],
    });

    const reply = response.choices?.[0]?.message?.content || "No reply.";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://nestedwisdom.com",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://nestedwisdom.com",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
}
