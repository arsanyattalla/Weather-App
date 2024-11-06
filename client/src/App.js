import React, { useState } from "react";
import "./App.css";
import image from "../src/clearsky.png";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [clear, setClear] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  const getWeather = async () => {
    if (city === "") {
      setErrorMessage(true);
      setWeather(null);
      return;
    }
  
    setErrorMessage(false);
    try {
      // Add the city query parameter to the API request
      const response = await fetch(`/.netlify/functions/api?city=${city}`);  // Pass city as a query param
      const data = await response.json();
  
      if (data.error === "City is required") {
        setWeather(null);
        setClear(null);
      } else {
        console.log(data);
        setWeather(data);
        if (data.weather[0].description === "clear sky") {
          setClear(true);
        } else {
          setClear(false);
        }
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setClear(false);
    }
  };

  return (
    <div className="background-image">
      <div className="content-wrapper">
        <h1 className="title">Weather App</h1>
        <div className="header">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
            className="city-input"
          />
          <button onClick={getWeather} className="weather-button">
            Get Weather
          </button>
        </div>
        {errorMessage && <p className="weather-info">Please Enter City</p>}
        {weather && (
          <div className="weather-info">
            <h2>{weather.name}</h2>

            {weather.main && weather.main.temp ? (
              <p>Temperature: {weather.main.temp}°C</p>
            ) : (
              <p>Please Enter a valid City Name</p>
            )}

            {weather.weather &&
            weather.weather[0] &&
            weather.weather[0].description ? (
              <p>Weather: {weather.weather[0].description}</p>
            ) : (
              <p></p>
            )}
            {clear ? <img className="image" alt="pic" src={image} /> : <p></p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
