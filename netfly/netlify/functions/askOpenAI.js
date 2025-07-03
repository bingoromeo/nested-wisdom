// File: netlify/functions/askOpenAI.js

export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { character, message } = JSON.parse(event.body);

    // Replace this with your OpenAI logic later
    const reply = `Hello from ${character}. You asked: ${message}`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message })
    };
  }
}
