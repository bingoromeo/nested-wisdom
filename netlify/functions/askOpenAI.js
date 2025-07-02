const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const { question, character } = JSON.parse(event.body);

  const systemPrompt = character === "Lily"
    ? "You are Lily, a wise and kind spiritual life coach who answers warmly and gently."
    : "You are Bingo, a witty and wise professor-like life coach with a slightly humorous tone.";

  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ answer: data.choices[0].message.content.trim() })
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "OpenAI error", details: data })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Request failed", message: error.message })
    };
  }
};
