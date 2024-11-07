import React, { useState } from "react";
import "../css/App.css";
import image from "../images/clearsky.png";
import cloud from "../images/cloudy.png";
import { WiThermometer } from "weather-icons-react";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [clear, setClear] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [temp, setTemp] = useState(null);
  const [cloudy, setCloudy] = useState(false);
  const [animate, setAnimate] = useState(false);

  const getWeather = async () => {
    if (city === "") {
      setErrorMessage(true);
      setWeather(null);
      return;
    }

    setErrorMessage(false);
    try {
      const response = await fetch(
        `http://localhost:5000/weather?city=${city}`
      );
      const data = await response.json();
      if (data.error === "City is required") {
        setWeather(null);
        setClear(false);
        setCloudy(false);
      } else {
        setWeather(data);
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500);

        let temp = (data.main.temp - 273.15) * (9 / 5) + 32;
        temp = Math.round(temp);
        setTemp(temp);

        let desc = data.weather[0].description;

        switch (desc) {
          case "clear sky":
            setClear(true);
            setCloudy(false);
            break;
          case "few clouds":
          case "cloudy":
            setCloudy(true);
            setClear(false);
            break;
          default:
            setCloudy(false);
            setClear(false);
        }
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setClear(false);
      setCloudy(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      getWeather();
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
            onKeyDown={handleKeyDown}
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
          <div className={`weather-info ${animate ? "animate" : ""}`}>
            <h2>{weather.name}</h2>
            {weather.main ? (
              <div className="temperature-container">
                <WiThermometer size={34} color="#428ee6" />
                <span>{temp}°F</span>
              </div>
            ) : (
              <p>Please Enter a valid City Name</p>
            )}

            {weather.weather && weather.weather[0] && (
              <div className="weather-content">
                {clear && <img className="image" alt="Clear sky" src={image} />}
                {cloudy && <img className="image" alt="Cloudy" src={cloud} />}
                <p>{weather.weather[0].description}</p>
                
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
