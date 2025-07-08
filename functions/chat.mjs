exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Allow": "POST",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const { character, message } = JSON.parse(event.body || "{}");

  // Validate input
  if (!character || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing character or message" }),
    };
  }

  // Simulate AI response or call OpenAI here
  const reply = `Hi! You said: "${message}"`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ reply }),
  };
};
