const fetch = require('node-fetch');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// In-memory cache (will reset on cold start in serverless env)
const audioCache = new Map();

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: 'OK' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: 'Method Not Allowed' };
  }

  try {
    const { text, character, voice_id } = JSON.parse(event.body);
    if (!text || !character) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: 'Missing `text` or `character` in request body.',
      };
    }

    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenlabsApiKey) {
      return { statusCode: 500, headers: CORS_HEADERS, body: 'Missing API key' };
    }

    const voiceIdMap = {
      Lily: 'pjcYQlDFKMbcOUp6F5GD',
      Bingo: 'v9LgF91V36LGgbLX3iHW',
    };

    const selectedVoiceId = voice_id || voiceIdMap[character];
    if (!selectedVoiceId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: 'Missing or invalid voice ID.',
      };
    }

    const cacheKey = `${character}:${text}`;
    if (audioCache.has(cacheKey)) {
      return {
        statusCode: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/plain',
        },
        body: audioCache.get(cacheKey),
      };
    }

    const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
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

    // Store in memory
    audioCache.set(cacheKey, base64Audio);

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
