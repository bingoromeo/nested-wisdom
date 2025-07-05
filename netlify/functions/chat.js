exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { character, message } = JSON.parse(event.body || "{}");

    if (!character || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing character or message" }),
      };
    }

    // Dummy response – customize later
    const reply = `This is a placeholder reply from ${character}. You asked: "${message}"`;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
