exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { message, character } = JSON.parse(event.body);

    // Simulate a response based on character
    let reply = "";
    if (character === "Lily") {
      reply = `Lily says: Thank you for your question!`;
    } else if (character === "Bingo") {
      reply = `Bingo says: Let's figure this out together.`;
    } else {
      reply = `Unknown character.`;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to parse request or generate response." }),
    };
  }
};
