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

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [triggerWeatherSearch, setTriggerWeatherSearch] = useState(false);

  const [showCanvas, setShowCanvas] = useState(true);
  const canvasRef = useRef(null);
  const searchContainerRef = useRef(null);
const [aiSuggestion, setAiSuggestion] = useState("");

  /* ---------------- AI INIT ---------------- */
  useEffect(() => {
    trainModel();
  }, []);
useEffect(() => {
  if (weather?.tempF != null) {
    const suggestion = getSuggestion(weather.tempF);
    setAiSuggestion(suggestion);
  }
}, [weather?.tempF]);
  /* ---------------- HELPERS ---------------- */
  const resetWeatherStates = () => {
    setHot(false);
    setCloudy(false);
    setRain(false);
    setNight(false);
  };

  const saveInput = (value) => {
    const stored = JSON.parse(localStorage.getItem("inputData")) || [];
    if (!stored.includes(value)) {
      stored.push(value);
      localStorage.setItem("inputData", JSON.stringify(stored));
    }
    setSuggestions(stored);
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
      const response = await fetch(`/.netlify/functions/api?city=${cityName}`);
      const data = await response.json();

      if (!data?.main?.temp) {
        setErrorMessage("Invalid city");
        resetWeatherStates();
        setLoading(false);
        return;
      }

      const tempF = Math.round((data.main.temp - 273.15) * (9 / 5) + 32);
      const desc = data.weather[0].description;

      setHot(tempF >= 75);
      setCloudy(desc.includes("cloud"));
      setRain(desc.includes("rain"));

   
      saveInput(cityName);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error fetching weather data");
      resetWeatherStates();
    } finally {
      setLoading(false);
    }
}, []);

  /* ---------------- INPUT HANDLERS ---------------- */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setTriggerWeatherSearch(true);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    setTriggerWeatherSearch(false);

    if (!value) {
      setShowSuggestions(false);
      return;
    }

    const stored = JSON.parse(localStorage.getItem("inputData")) || [];
    setSuggestions(
      stored.filter((item) =>
        item.toLowerCase().startsWith(value.toLowerCase())
      )
    );
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (value) => {
    setCity(value);
    setShowSuggestions(false);
    setTriggerWeatherSearch(true);
  };

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------- AUTO REFRESH ---------------- */
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

  /* ---------------- GEOLOCATION ---------------- */
  const handleUseMyLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const apiKey = "YOUR_API_KEY";
      const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data[0]?.name) {
        setCity(data[0].name);
        setTriggerWeatherSearch(true);
      }
    });
  };

  /* ---------------- RENDER ---------------- */
  return (
    <>
      {showCanvas && (
        <div>
          <canvas ref={canvasRef} className="canvas-animation" />
          <div className="canvas-text">Weather App</div>
        </div>
      )}

      {!showCanvas && (
        <div className="background-image">
          <div className="content-wrapper">
            <div className="search-container" ref={searchContainerRef}>
              <input
                value={city}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter city"
              />
              <button onClick={() => getWeather(city)}>Search</button>
              <button onClick={handleUseMyLocation}>Use My Location</button>

              {showSuggestions && (
                <div className="suggestions-dropdown">
                  {suggestions.map((s, i) => (
                    <div key={i} onClick={() => handleSuggestionClick(s)}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {loading && <OrbitProgress size="small" />}
            {errorMessage && <p>{errorMessage}</p>}

            {weather && (
              <div className="weather-info">
                <h2>{weather.name}</h2>

                <div className="weather-content">
                  {cloudy && <img src={cloud} alt="cloudy" />}
                  {!cloudy && !rain && <img src={image} alt="clear" />}
                  {night && <WiMoonWaxingCrescent3 />}
                  {rain && <WiRainMix />}
                </div>

                <div className="temperature-container">
                  <WiThermometer color={hot ? "#e04b4b" : "#428ee6"} />
                  <span>{weather.tempF}°F</span>
                </div>

                <div className="ai-suggestion">
                  <h3>AI Suggestion</h3>
                  <p>{weather.aiSuggestion}</p>
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
