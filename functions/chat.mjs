import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://nestedwisdom.com",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "OK",
    };
  }

  const { character, message } = JSON.parse(event.body || '{}');

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are ${character}` },
        { role: "user", content: message },
      ],
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://nestedwisdom.com",
      },
      body: JSON.stringify({ reply: response.choices[0].message.content }),
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
