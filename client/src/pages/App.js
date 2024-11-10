import React, { useState, useEffect, useCallback } from "react";
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
  const[rain, setRain ] = useState(false)
  const getWeather = useCallback(async () => {
    setLoading(true);
    setWeather(null);

    if (city === "") {
      setErrorMessage("Please Enter a City name");
      setLoading(false);
      return;
    }

    setErrorMessage(false);

    const now = new Date();
    const hour = now.getHours();
    if (hour >= 18 || hour < 5) {
      setNight(true);
    } else {
      setNight(false);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/weather?city=${city}`
      );
      const data = await response.json();
      console.log(data);
      setTimeout(() => {
        setLoading(false);
        if (data.error === "City is required") {
          setWeather(null);
          setClear(false);
          setCloudy(false);
          setNight(false)
          setRain(false)
        } else if (!data.main || !data.main.temp) {
          setErrorMessage("Invalid city");
          setWeather(null);
          setClear(false);
          setCloudy(false);
          setCold(false);
          setTemp(null);
          setHot(false);
          setRain(false)
          setNight(false)
        } else {
          setWeather(data);
          console.log(night)
          setAnimate(true);
          setTimeout(() => setAnimate(false), 500);

          let temp = (data.main.temp - 273.15) * (9 / 5) + 32;
          temp = Math.round(temp);
          if (temp < 75) {
            setCold(true);
            setHot(false);
          } else {
            setCold(false);
            setHot(true);
          }
          setTemp(temp);
          let tempMax = (data.main.temp_max - 273.15) * (9 / 5) + 32;
          let tempMin = (data.main.temp_min - 273.15) * (9 / 5) + 32;
          tempMax = Math.round(tempMax);
          tempMin = Math.round(tempMin);

          setTempMin(tempMin);
          setTempMax(tempMax);

          let desc = data.weather[0].description;
          if (desc === "clear sky") {
            setClear(true);
            setCloudy(false);
            setRain(false)
          } else if (desc.includes("clouds") || desc === "cloudy") {
            setCloudy(true);
            setClear(false);
            setRain(false);
          } else if (desc.includes("rain")) {
            setCloudy(false);
            setClear(false);
            setRain(true)
          }else{
            setCloudy(false);
            setClear(false);
          }
        }
      }, 1000);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setClear(false);
      setCloudy(false);
      setLoading(false);
    }
  }, [city,night]);

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
    }, 60000);

    return () => clearInterval(interval);
  }, [city, getWeather]);

  return (
    <div
      className={`background-image ${cold && night && !cloudy ? "background-cold" : ""} ${
        !hot && clear && cold && !night ? "background-hot" : ""
      } ${cold && night && cloudy ? "background-image" : ""} ${cold && night && clear ? "background-cold" : ""} ${!cold && hot && !night && clear ? "background-hot" : ""} ${rain && !night  ? "background-rain-day" : ""} ${rain && night  ? "background-rain-night" : ""} `}
    >
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
        {errorMessage && <p className="weather-info">{errorMessage}</p>}
        {loading && (
          <OrbitProgress variant="track-disc" color="#56667e" size="small" />
        )}
        {!loading && weather && (
          <div className={`weather-info ${animate ? "animate" : ""}`}>
            <h2>{weather.name}</h2>
            {weather.weather && weather.weather[0] && (
              <div className="weather-content">
                {clear && !night && <img className="image" alt="Clear sky" src={image} />}
                {cloudy && !rain && <img className="image" alt="Cloudy" src={cloud} />}
                {night && clear && <WiMoonWaxingCrescent3 size={30} color='#aebe16'/>}
                {rain && <WiRainMix size={32} color='#428ee6'/>}


                
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
