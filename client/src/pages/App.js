import React, { useState , useEffect } from "react";
import "../css/App.css";
import image from "../images/clearsky.png";
import cloud from "../images/cloudy.png";
import { WiThermometer } from "weather-icons-react";
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
  const [cold,setCold] = useState(false)

  const getWeather = async () => {
    setLoading(true);
    setWeather(null);  

    if (city === "") {
      setErrorMessage('Please Enter City name');
      setLoading(false);
      return;
    }

    setErrorMessage(false);
    try {
      const response = await fetch(`http://localhost:5000/weather?city=${city}`);
      const data = await response.json();
    
      setTimeout(() => {
        setLoading(false);
    
        if (!data.main || !data.main.temp) {  
          setErrorMessage("Invalid city");
          setWeather(null);
          setClear(false);
          setCloudy(false);
        } else {
          setWeather(data);
          setAnimate(true);
          setTimeout(() => setAnimate(false), 500);
    
          let temp = (data.main.temp - 273.15) * (9 / 5) + 32;
          temp = Math.round(temp);
          setCold(temp <= 70); 
          setTemp(temp);
    
          let desc = data.weather[0].description;
    
          switch (desc) {
            case "clear sky":
              setClear(true);
              setCloudy(false);
              break;
            case "few clouds":
            case "cloudy":
            case "overcast clouds":
              setCloudy(true);
              setClear(false);
              break;
            default:
              setCloudy(false);
              setClear(false);
          }
        }
      }, 1000);
    
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setErrorMessage("Failed to fetch weather data.");
      setClear(false);
      setCloudy(false);
      setLoading(false);
    }
  }
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
    }, 120000); // Fetches weather data every 60 seconds

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, [city]); // Rerun effect if city changes

  return (
    <div className={`background-image ${cold ? "background-cold" : ""}`}>
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
          <OrbitProgress variant="track-disc" color="#56667e" size="small" text="" textColor="#521d1d" />
        )}
        {!loading && weather && (
          <div className={`weather-info ${animate ? "animate" : ""}`}>
            <h2>{weather.name}</h2>
            {weather.weather && weather.weather[0] && (
              <div className="weather-content">
                {clear && <img className="image" alt="Clear sky" src={image} />}
                {cloudy && <img className="image" alt="Cloudy" src={cloud} />}
                <p>{weather.weather[0].description}</p>
              </div>
            )}
            {weather.main ? (
              <div className="temperature-container">
                <WiThermometer size={34} color="#428ee6" />
                <span>{temp}°F</span>
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
