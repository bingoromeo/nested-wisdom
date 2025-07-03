const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { character, message } = JSON.parse(event.body);

    const reply = `Hi! This is ${character}. You said: "${message}"`;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." })
    };
  }
};
