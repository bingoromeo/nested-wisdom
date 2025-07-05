exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { character, message } = JSON.parse(event.body);

    const reply = `Hi from ${character}! You asked: "${message}"`;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};
