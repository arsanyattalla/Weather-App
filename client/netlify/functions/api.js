const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const city = event.queryStringParameters.city;
  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "City is required" }),
    };
  }

  const apiKey = '30d4741c779ba94c470ca1f63045390a';
 

  const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  try {
    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (response.status === 200) {
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Weather data not found" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
