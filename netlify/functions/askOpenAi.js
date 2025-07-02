const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { character, message } = JSON.parse(event.body);

  const systemPrompt = character === "Lily"
    ? "You are Lily, a wise and kind spiritual life coach who answers warmly and gently."
    : "You are Bingo, a witty and wise professor-like life coach with a slightly humorous tone.";

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.8,
      }),
    });

    const data = await openaiResponse.json();

    if (openaiResponse.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: data.choices[0].message.content.trim() }),
      };
    } else {
      console.error("OpenAI API Error:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: "OpenAI API error occurred." }),
      };
    }
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Server error occurred." }),
    };
  }
};
