const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in Netlify env vars!
});

const openai = new OpenAIApi(configuration);

exports.handler = async function (event) {
  const { character, message } = JSON.parse(event.body);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: `You are ${character}, a friendly parrot.` },
        { role: "user", content: message },
      ],
    });

    const reply = completion.data.choices[0].message.content;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Oops! Something went wrong." }),
    };
  }
};
