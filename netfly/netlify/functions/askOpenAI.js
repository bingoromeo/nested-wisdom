export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { character, message } = JSON.parse(event.body);

    const reply = `Hello from ${character}. You asked: ${message}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error", details: error.message })
    };
  }
}
