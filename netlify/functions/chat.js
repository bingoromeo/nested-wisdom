const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { character, message } = body;

    console.log("Character received:", character);  // ✅ Log for debugging

    let characterPrompt = "";

    if (character === "Lily") {
      characterPrompt = "You are Lily, a kind, gentle, and caring conversational guide. Speak with empathy and calm support.";
    } else if (character === "Bingo") {
      characterPrompt = "You are Bingo, a lively, fun, and energetic assistant. Be playful, creative, and expressive.";
    } else {
      characterPrompt = "You are a helpful assistant.";
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: characterPrompt },
        { role: "user", content: message },
      ],
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: completion.data.choices[0].message.content }),
    };
  } catch (err) {
    console.error("Chat function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong" }),
    };
  }
};
// force redeploy
