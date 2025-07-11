// netlify/functions/chat.cjs
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ALLOWED_ORIGIN = "https://www.nestedwisdom.com";
const MAX_FREE_MESSAGES = 2;

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: "Method Not Allowed",
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: JSON.stringify({ reply: "Invalid request body." }),
    };
  }

  const { character, message } = body;
  if (!character || !message) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: JSON.stringify({ reply: "Missing character or message." }),
    };
  }

  const ip = event.headers["x-forwarded-for"] || "unknown";

  try {
    const usageCount = await getUsageCount(ip);
    const paid = await isPaidUser(ip);

    if (!paid && usageCount >= MAX_FREE_MESSAGES) {
      return {
        statusCode: 402,
        headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
        body: JSON.stringify({ reply: "You've reached your free question limit. Please upgrade to continue." })
      };
    }

    const model = paid ? "gpt-4" : "gpt-3.5-turbo";

    const chatCompletion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `You are ${character}, a wise and witty parrot who speaks to users.`,
        },
        { role: "user", content: message },
      ],
    });

    const reply = chatCompletion.choices[0].message.content.trim();

    await logUsage(ip, character);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("OpenAI error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: JSON.stringify({ reply: "AI error occurred." }),
    };
  }
};

async function logUsage(ip, character) {
  await supabase.from("usage_logs").insert([{ ip_address: ip, character }]);
}

async function getUsageCount(ip) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact" })
    .eq("ip_address", ip)
    .gte("timestamp", since);
  return data?.length || 0;
}

async function isPaidUser(ip) {
  const { data, error } = await supabase
    .from("payments")
    .select("id")
    .eq("ip_address", ip)
    .maybeSingle();
  return !!data;
}
