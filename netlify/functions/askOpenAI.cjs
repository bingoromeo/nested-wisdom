// netlify/functions/askOpenAI.js
exports.handler = async function(event, context) {
  // --- CORS preflight ----------------------------------------
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  // --- Only POST allowed ------------------------------------
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // --- Your logic -------------------------------------------
  try {
    const payload = JSON.parse(event.body || "{}");
    const character = String(payload.character || "").trim();
    const message   = String(payload.message   || "").trim();

    // For debug — this will show up in your Netlify function logs:
    console.log("askOpenAI called with character:", character, "and message:", message);

    const key = character.toLowerCase();
    let reply;
    if (key === "lily") {
      reply = `Lily says: Thank you for your question!`;
    }
    else if (key === "willy") {
      reply = `Willy says: Let's figure this out together.`;
    }
    else {
      reply = `Unknown character: ${character}`;
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  }
  catch (err) {
    console.error("askOpenAI error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to parse request or generate response." }),
    };
  }
};
