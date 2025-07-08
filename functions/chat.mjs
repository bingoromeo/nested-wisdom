// netlify/functions/chat.mjs
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event) {
  const allowedOrigins = [
    "https://nestedwisdom.com",
    "https://www.nestedwisdom.com"
  ];

  const origin = event.headers.origin;

  const headers = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "https://nestedwisdom.com",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { character, message } = JSON.parse(event.body || "{}");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are ${character}` },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0]?.message?.content || "No reply.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
}
