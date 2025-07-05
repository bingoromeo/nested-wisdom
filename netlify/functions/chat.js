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
    const { character, message } = JSON.parse(event.body);

    const prompt = `${character} says: ${message}`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4", // or gpt-3.5-turbo
      messages: [
        { role: "system", content: `You are ${character}, a helpful parrot assistant.` },
        { role: "user", content: message },
      ],
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: completion.data.choices[0].message.content }),
    };
  } catch (error) {
    console.error("Error in chat function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch reply." }),
    };
  }
};
