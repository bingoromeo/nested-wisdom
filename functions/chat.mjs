export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "https://nestedwisdom.com",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  console.log("🔍 Incoming request:", event.httpMethod, event.headers.origin);

  if (event.httpMethod === "OPTIONS") {
    console.log("🔁 Preflight request");
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    console.log("🚫 Invalid method:", event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { character, message } = JSON.parse(event.body || "{}");
    console.log("💬 character:", character, "message:", message);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are ${character}` },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0]?.message?.content || "No reply.";
    console.log("✅ reply:", reply);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error("🔥 Error:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
}
