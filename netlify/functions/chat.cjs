// netlify/functions/chat.cjs
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reply: "Invalid request body." }),
    };
  }

  const { character, message } = body;
  if (!character || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reply: "Missing character or message." }),
    };
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: `You are ${character}, a wise and witty parrot who speaks to users.` },
        { role: "user", content: message },
      ],
    });

    const reply = completion.data.choices[0].message.content.trim();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("OpenAI error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "AI error occurred." }),
    };
  }
};
