// netlify/functions/askOpenAI.js
exports.handler = async function(event, context) {
  // 1️⃣ Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",                    // <-- allow all origins
        "Access-Control-Allow-Methods": "POST, OPTIONS",      // <-- allow these methods
        "Access-Control-Allow-Headers": "Content-Type",       // <-- allow this header
      },
      body: "",
    };
  }

  // 2️⃣ Reject everything but POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // 3️⃣ Your actual handler
  try {
    const { message, character } = JSON.parse(event.body);

    let reply = "";
    if (character === "Lily") {
      reply = `Lily says: Thank you for your question!`;
    } else if (character === "Bingo") {
      reply = `Bingo says: Let's figure this out together.`;
    } else {
      reply = `Unknown character: ${character}`;
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",  // <-- again allow your frontend to read this
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to parse request or generate response." }),
    };
  }
};
