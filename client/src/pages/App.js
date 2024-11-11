import React, { useState, useEffect, useCallback, useRef } from "react";
import "../css/App.css";
import image from "../images/clearsky.png";
import cloud from "../images/cloudy.png";
import { WiThermometer, WiMoonWaxingCrescent3, WiRainMix } from "weather-icons-react";
import { OrbitProgress } from "react-loading-indicators";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [clear, setClear] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [temp, setTemp] = useState(null);
  const [cloudy, setCloudy] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cold, setCold] = useState(false);
  const [hot, setHot] = useState(false);
  const [tempMax, setTempMax] = useState(null);
  const [tempMin, setTempMin] = useState(null);
  const [night, setNight] = useState(false);
  const [rain, setRain] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  function saveInput(cityName) {
    localStorage.clear()
    let savedData = JSON.parse(localStorage.getItem("inputData")) || [];
    
    if (!savedData.some(savedCity => savedCity.toLowerCase() === cityName.toLowerCase())) {
      savedData.push(cityName);
      localStorage.setItem("inputData", JSON.stringify(savedData));
    }
  }

  useEffect(() => {
    const savedSuggestions = JSON.parse(localStorage.getItem("inputData")) || [];
    setSuggestions(savedSuggestions);
  }, []);

  const handleInputChange = (event) => {
    const input = event.target.value;
    setCity(input);
    setFilteredSuggestions(
      suggestions.filter((suggestion) =>
        suggestion.toLowerCase().startsWith(input.toLowerCase())
      )
    );
    setShowSuggestions(true);
  };

  const handleFocus = () => {
    setFilteredSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const selectSuggestion = (suggestion) => {
    setCity(suggestion);
    setShowSuggestions(false); // Hide suggestions after selection
  };

  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getWeather = useCallback(async () => {
    setLoading(true);
    setWeather(null);

    if (city === "") {
      setErrorMessage("Please Enter a City name");
      setLoading(false);
      return;
    }

    saveInput(city);
    setErrorMessage(false);

    const now = new Date();
    const hour = now.getHours();
    setNight(hour >= 18 || hour < 5);

    try {
      const response = await fetch(`/.netlify/functions/api?city=${city}`);
      const data = await response.json();

      setTimeout(() => {
        setLoading(false);
        if (data.error === "City is required") {
          setWeather(null);
          setClear(false);
          setCloudy(false);
          setNight(false);
          setRain(false);
        } else if (!data.main || !data.main.temp) {
          setErrorMessage("Invalid city");
          setWeather(null);
          setClear(false);
          setCloudy(false);
          setCold(false);
          setTemp(null);
          setHot(false);
          setRain(false);
          setNight(false);
        } else {
          setWeather(data);
          setAnimate(true);
          setTimeout(() => setAnimate(false), 500);

          let temp = (data.main.temp - 273.15) * (9 / 5) + 32;
          temp = Math.round(temp);
          setCold(temp < 75);
          setHot(temp >= 75);
          setTemp(temp);

          let tempMax = (data.main.temp_max - 273.15) * (9 / 5) + 32;
          let tempMin = (data.main.temp_min - 273.15) * (9 / 5) + 32;
          setTempMax(Math.round(tempMax));
          setTempMin(Math.round(tempMin));

          const desc = data.weather[0].description;
          setClear(desc === "clear sky");
          setCloudy(desc.includes("clouds") || desc === "cloudy");
          setRain(desc.includes("rain"));
        }
      }, 1000);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setClear(false);
      setCloudy(false);
      setLoading(false);
    }
  }, [city]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      getWeather();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (city) {
        getWeather();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [city, getWeather]);

  return (
    <div
      className={`background-image ${cold && night && !cloudy ? "background-cold" : ""} ${
        !hot && clear && cold && !night ? "background-hot" : ""
      } ${cold && night && cloudy ? "background-image" : ""} ${cold && night && clear ? "background-cold" : ""} ${!cold && hot && !night && clear ? "background-hot" : ""} ${rain && !night ? "background-rain-day" : ""} ${rain && night ? "background-rain-night" : ""} `}
    >
      <div className="content-wrapper">
        <h1 className="title">Weather App</h1>
        <div className="header" ref={inputRef}>
          <input
            type="text"
            value={city}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="Enter city"
            className="city-input"
          />
          {showSuggestions && (
            <div className="suggestions-dropdown">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          <button onClick={getWeather} className="weather-button">
            Get Weather
          </button>
          
        </div>
        {errorMessage && <p className="weather-info">{errorMessage}</p>}
        {loading && <OrbitProgress variant="track-disc" color="#56667e" size="small" />}
        {!loading && weather && (
          <div className={`weather-info ${animate ? "animate" : ""}`}>
            <h2>{weather.name}</h2>
            {weather.weather && weather.weather[0] && (
              <div className="weather-content">
                {clear && !night && <img className="image" alt="Clear sky" src={image} />}
                {cloudy && !rain && <img className="image" alt="Cloudy" src={cloud} />}
                {night && clear && <WiMoonWaxingCrescent3 size={30} color="#aebe16" />}
                {rain && <WiRainMix size={32} color="#428ee6" />}
                <p>{weather.weather[0].description}</p>
              </div>
            )}
            {weather.main ? (
              <div className="temperature-container">
                {hot && <WiThermometer size={34} color="#e04b4b" />}
                {!hot && <WiThermometer size={34} color="#428ee6" />}
                <span>{temp}°F</span>
              </div>
            ) : (
              <p>Please Enter a valid City Name</p>
            )}
            {weather.main ? (
              <div className="temperature-container">
                <WiThermometer size={34} color="#e04b4b" />
                <span className="space">H: {tempMax}°F</span>
                <WiThermometer size={34} color="#428ee6" />
                <span>L: {tempMin}°F</span>
              </div>
            ) : (
              <p>Please Enter a valid City Name</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
