import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function handler(event) {
  const { character, message } = JSON.parse(event.body || '{}');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `You are ${character}` },
        { role: 'user', content: message },
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: response.choices[0].message.content }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
