const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  // Extract the city from the query string
  const city = event.queryStringParameters.city;
  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "City is required" }),
    };
  }

  // Retrieve the API key from environment variables
  const apiKey = '30d4741c779ba94c470ca1f63045390a';
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key is missing" }),
    };
  }

  // Build the URL for OpenWeatherMap
  const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  try {
    // Fetch the weather data
    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (response.status === 200) {
      // Return the weather data in the response
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
    // Handle errors
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
