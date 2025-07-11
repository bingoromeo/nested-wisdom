// ./api/speak.cjs

const fetch = require('node-fetch');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // You can replace * with your domain for stricter security
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: 'OK',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { text, character } = JSON.parse(event.body);
    if (!text || !character) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: 'Missing `text` or `character` in request body.',
      };
    }

    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenlabsApiKey) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
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
        headers: CORS_HEADERS,
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
        headers: CORS_HEADERS,
        body: `Error from ElevenLabs: ${errorText}`,
      };
    }

    const audioBuffer = await voiceResponse.buffer();
    const base64Audio = audioBuffer.toString('base64');

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/plain',
      },
      body: base64Audio,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: `Unexpected error: ${err.message}`,
    };
  }
};
