import React, { useState, useEffect, useRef, useCallback } from "react";
import "../css/App.css";
import image from "../images/clearsky.png";
import cloud from "../images/cloudy.png";
import {
  WiThermometer,
  WiMoonWaxingCrescent3,
  WiRainMix,
} from "weather-icons-react";
import { OrbitProgress } from "react-loading-indicators";
import { trainModel, getSuggestion } from "../utils/aiModel";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [hot, setHot] = useState(false);
  const [night, setNight] = useState(false);
  const [cloudy, setCloudy] = useState(false);
  const [rain, setRain] = useState(false);

  const [triggerWeatherSearch, setTriggerWeatherSearch] = useState(false);

  const [showCanvas, setShowCanvas] = useState(true);
  const canvasRef = useRef(null);
  const searchContainerRef = useRef(null);
  const [aiSuggestion, setAiSuggestion] = useState("");

  /* ---------------- AI INIT ---------------- */
  useEffect(() => {
    trainModel();
  }, []);
  
  /* ---------------- HELPERS ---------------- */
  const resetWeatherStates = () => {
    setHot(false);
    setCloudy(false);
    setRain(false);
    setNight(false);
  };

  /* ---------------- WEATHER FETCH ---------------- */
  const getWeather = useCallback(async (cityName) => {
    if (!cityName.trim()) {
      setErrorMessage("Please enter a city name");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const hour = new Date().getHours();
    setNight(hour >= 18 || hour < 5);

    try {
      
      const response = await fetch(`./netlify/functions/weather?city=${cityName}`);
      //const response = await fetch(
        //`http://localhost:5000/weather?city=${cityName}`
      //);

      const data = await response.json();
      //const data = await response.json();

      const tempF = Math.round((data.main.temp - 273.15) * (9 / 5) + 32);
      console.log(data.main.temp);
      console.log(tempF);
      setWeather({
        ...data,
        tempF,
      });
      const desc = data.weather[0].description;

      setHot(tempF >= 75);
      setCloudy(desc.includes("cloud"));
      setRain(desc.includes("rain"));
    } catch (err) {
      console.error(err);
      setErrorMessage("Error fetching weather data");
      resetWeatherStates();
    } finally {
      setLoading(false);
    }
  }, []);
useEffect(() => {
    if (weather?.tempF != null) {
      const suggestion = getSuggestion(weather.tempF);
      console.log(weather.tempF, suggestion);
      setAiSuggestion(suggestion);
    }
  }, [getWeather, weather]);
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    setTriggerWeatherSearch(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (city) getWeather(city);
    }, 60000);

    return () => clearInterval(interval);
  }, [city, getWeather]);

  useEffect(() => {
    if (triggerWeatherSearch && city) {
      getWeather(city);
      setTriggerWeatherSearch(false);
    }
  }, [triggerWeatherSearch, city, getWeather]);

  /* ---------------- CANVAS ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => setShowCanvas(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleUseMyLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const apiKey = "30d4741c779ba94c470ca1f63045390a";
      const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data[0]?.name) {
        setCity(data[0].name);
        setTriggerWeatherSearch(true);
      }
    });
  };

  return (
    <>
      {showCanvas && (
        <div>
          <canvas ref={canvasRef} className="canvas-animation" />
          <div className="canvas-text">
            <img
              className="img"
              alt="img"
              src={"./weather-icon-illustration03-Graphics-10205167-1.jpg"}
            ></img>
          </div>
        </div>
      )}

      {!showCanvas && (
        <div className="background-image">
          <div className="content-wrapper">
            <div className="header-image">
              <img
                className="img"
                alt="img"
                src={"./weather-icon-illustration03-Graphics-10205167-1.jpg"}
              ></img>
              <h1 className="title">Weather</h1>
            </div>
            <div className="search-container" ref={searchContainerRef}>
              <input
                value={city}
                onChange={handleInputChange}
                placeholder="Enter city"
                className="city-input"
              />
              <button
                className="weather-button"
                onClick={() => getWeather(city)}
              >
                Search
              </button>
              <href className="location" onClick={handleUseMyLocation}>
                Use My Location
              </href>
            </div>

            {loading && <OrbitProgress size="small" />}
            {errorMessage && <p>{errorMessage}</p>}

            {weather && (
              <div className="weather-info">
                <div className="head">
                  <h2>{weather.name}</h2>
                </div>
                <div className="weather-content">
                  {cloudy && <img className="img" src={cloud} alt="cloudy" />}
                  {!cloudy && !rain && (
                    <img className="img" src={image} alt="clear" />
                  )}
                  {night && !rain && !cloudy && <WiMoonWaxingCrescent3 />}
                  {rain && <WiRainMix />}
                </div>

                <div className="temperature-container">
                  <WiThermometer color={hot ? "#e04b4b" : "#428ee6"} />
                  <span>{weather.tempF}°F</span>
                </div>

                <div className="temperature-container">
                  <p>{aiSuggestion}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
