const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    const { character, message } = JSON.parse(event.body);

    const systemPrompt = character === "Lily"
      ? "You are Lily, a wise and kind spiritual life coach who answers warmly and gently."
      : "You are Bingo, a witty and wise professor-like life coach with a slightly humorous tone.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
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

    if (response.ok && data.choices && data.choices.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: data.choices[0].message.content.trim() })
      };
    } else {
      console.error("OpenAI Error:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ reply: "Sorry, I couldn't get a response from OpenAI." })
      };
    }

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "There was a server error. Please try again later." })
    };
  }
};
