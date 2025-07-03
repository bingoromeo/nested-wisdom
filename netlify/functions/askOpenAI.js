import { Configuration, OpenAIApi } from "openai";
import { createClient } from "@supabase/supabase-js";

// —––––––––––––––––––––––––––––––––––––––––––––
// 1) Initialize Supabase & OpenAI clients
// —––––––––––––––––––––––––––––––––––––––––––––
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

// —––––––––––––––––––––––––––––––––––––––––––––
// 2) Export the handler
// —––––––––––––––––––––––––––––––––––––––––––––
export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let character, message;
  try {
    ({ character, message } = JSON.parse(event.body));
  } catch {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  try {
    // —––––––––––––––––––––––––––––––––––––––––––––
    // 3) Call OpenAI Chat Completion
    // —––––––––––––––––––––––––––––––––––––––––––––
    const systemPrompt =
      character === "Lily"
        ? "You are Lily, a kind, helpful assistant. Keep your tone warm and friendly."
        : "You are Bingo, a curious, problem-solving assistant. Keep your tone upbeat.";

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const reply = completion.data.choices[0]?.message?.content.trim() || "";

    // —––––––––––––––––––––––––––––––––––––––––––––
    // 4) (Optional) Log to Supabase
    // —––––––––––––––––––––––––––––––––––––––––––––
    // Note: remove if you don’t want persistence
    await supabase.from("messages").insert([
      { user: character, message },
      { user: character + "_reply", message: reply },
    ]);

    // —––––––––––––––––––––––––––––––––––––––––––––
    // 5) Return the assistant’s reply
    // —––––––––––––––––––––––––––––––––––––––––––––
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
