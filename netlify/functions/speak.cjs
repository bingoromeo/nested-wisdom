
    const audioBuffer = await response.arrayBuffer();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "https://www.nestedwisdom.com"
      },
      body: Buffer.from(audioBuffer).toString("base64"),
      isBase64Encoded: true
    };
  } catch (err) {
    console.error("Speak error:", err);
    return {
      statusCode: 500,
      body: "Voice generation failed"
    };
  }
};
