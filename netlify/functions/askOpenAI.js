exports.handler = async function(event, context) {
  // 1) Common CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",            // allow any origin (or lock this down to your Webflow URL)
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
  };

  // 2) Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  // 3) Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { character, message } = JSON.parse(event.body);

    // simulate or call OpenAI here
    let reply = "";
    if (character === "Lily") {
      reply = `Lily says: Thanks for asking!`;
    } else if (character === "Bingo") {
      reply = `Bingo says: Let’s figure this out together.`;
    } else {
      reply = `Unknown character.`;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
