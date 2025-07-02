const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { character, message } = JSON.parse(event.body);

  const systemPrompt = character === "Lily"
    ? "You are Lily, a wise and kind spiritual life coach who answers warmly and gently."
    : "You are Bingo, a witty and wise professor-like life coach with a slightly humorous tone.";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices[0].message.content.trim() })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Sorry, something went wrong." })
    };
  }
};
