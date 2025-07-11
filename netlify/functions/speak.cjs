// ./api/speak.cjs

const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { text, character } = JSON.parse(event.body);
    if (!text || !character) {
      return {
        statusCode: 400,
        body: 'Missing `text` or `character` in request body.',
      };
    }

    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenlabsApiKey) {
      return {
        statusCode: 500,
        body: 'Missing ElevenLabs API key',
      };
    }

    const voiceIdMap = {
      Lily: 'EXAVITQu4vr4xnSDxMaL',
      Bingo: 'MF3mGyEYCl7XYWbV9V6O',
    };

    const voiceId = voiceIdMap[character];
    if (!voiceId) {
      return {
        statusCode: 400,
        body: 'Invalid character name.',
      };
    }

    const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenlabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!voiceResponse.ok) {
      const errorText = await voiceResponse.text();
      return {
        statusCode: voiceResponse.status,
        body: `Error from ElevenLabs: ${errorText}`,
      };
    }

    const audioBuffer = await voiceResponse.buffer();
    const base64Audio = audioBuffer.toString('base64');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: base64Audio,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Unexpected error: ${err.message}`,
    };
  }
};
