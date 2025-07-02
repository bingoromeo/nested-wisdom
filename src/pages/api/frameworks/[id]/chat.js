export const prerender = false;

// src/pages/api/chat.js
export async function post({ request }) {
  const { prompt, character } = await request.json();

  const systemPrompt = character === "Lily"
    ? "You are Lily, a wise and kind spiritual life coach who answers warmly and gently."
    : "You are Bingo, a witty and wise professor-like life coach with a slightly humorous tone.";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.8
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
