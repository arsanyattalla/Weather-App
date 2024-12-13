import React, { useState, useEffect, useCallback, useRef } from "react"; 
import "../css/App.css";
import image from "../images/clearsky.png";
import cloud from "../images/cloudy.png";
import {
  WiThermometer,
  WiMoonWaxingCrescent3,
  WiRainMix,
} from "weather-icons-react";
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
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [triggerWeatherSearch, setTriggerWeatherSearch] = useState(false);
  const [showCanvas, setShowCanvas] = useState(true); // State for showing canvas animation

  const canvasRef = useRef(null);
  const searchContainerRef = useRef(null);

  const saveInput = (data) => {
    let savedData = JSON.parse(localStorage.getItem("inputData")) || [];

    if (!savedData.includes(data)) {
      savedData.push(data);
      localStorage.setItem("inputData", JSON.stringify(savedData));
      setSuggestions(savedData);
    }
  };

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
      const response = await fetch(`/.netlify/functions/api?city=${city}`);
      //const response = await fetch(`http://localhost:5000/weather?city=${city}`);

      const data = await response.json();
      console.log(data);
      console.log(city);
      console.log(suggestions);
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
          saveInput(city);

          setWeather(data);
          console.log(night);
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
            setRain(false);
          } else if (desc.includes("clouds") || desc === "cloudy") {
            setCloudy(true);
            setClear(false);
            setRain(false);
          } else if (desc.includes("rain")) {
            setCloudy(false);
            setClear(false);
            setRain(true);
          } else {
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
  }, [city, night, suggestions]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setTriggerWeatherSearch(true); 
    }
  };

  const handleInputChange = (event) => {
    const input = event.target.value;
    setCity(input);
    setTriggerWeatherSearch(false); 

    if (input) {
      const savedData = JSON.parse(localStorage.getItem("inputData")) || [];
      const filteredSuggestions = savedData.filter((suggestion) =>
        suggestion.toLowerCase().startsWith(input.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions(JSON.parse(localStorage.getItem("inputData")) || []);
    }
  
    setShowSuggestions(true);
  };

  const handleClickOutside = (event) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (city) {
        getWeather();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [city, getWeather]);

  useEffect(() => {
    if (triggerWeatherSearch && city) {
      getWeather();
      setTriggerWeatherSearch(false); 
    }
  }, [triggerWeatherSearch, city, getWeather]);

  useEffect(() => {
    
    setTimeout(() => {
      setShowCanvas(false);
    }, 3000); 
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
    setShowSuggestions(false);
    setTriggerWeatherSearch(true); 
  };

  
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
  
    const animateCircles = () => {
      ctx.clearRect(0, 0, width, height); 
  
     
     
      ctx.fillText("Weather App", width / 2, height / 2); 
  
      requestAnimationFrame(animateCircles); 
    };
  
    animateCircles();
  };
  
  
  useEffect(() => {
    const canvas = canvasRef.current; 
    if (showCanvas) {
      drawCanvas(); 
    }
  
    return () => {
      
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
      }
    };
  }, [showCanvas]);
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    
    updateCanvasSize();

    
    window.addEventListener("resize", updateCanvasSize);

    
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);


  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const apiKey = "30d4741c779ba94c470ca1f63045390a"; // Replace with your actual reverse geocoding API key
        const reverseGeocodeURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

        try {
          const response = await fetch(reverseGeocodeURL);
          const data = await response.json();
          if (data.length > 0 && data[0].name) {
            const currentCity = data[0].name;
            setCity(currentCity);
            setTriggerWeatherSearch(true);
          } else {
            setErrorMessage("Unable to fetch location");
          }
        } catch (error) {
          console.error("Error fetching location data:", error);
          setErrorMessage("Error fetching location");
        }
      });
    } else {
      setErrorMessage("Geolocation is not supported by your browser");
    }
  };
  return (
    <>
      {}
      {showCanvas && (
        <div>
          {}
          <canvas ref={canvasRef} className="canvas-animation" />
          {}
          <div className="canvas-text">Weather App</div>
        </div>
      )}

      {!showCanvas && (

      
      <div
        className={`background-image ${cold && night && !cloudy ? "background-cold" : ""} ${!hot && clear && cold && !night ? "background-hot" : ""} ${cold && night && cloudy ? "background-cloudy" : ""} ${cold && night && clear ? "background-cold" : ""} ${!cold && hot && !night && clear ? "background-hot" : ""} ${rain && !night ? "background-rain-day" : ""} ${rain && night ? "background-rain-night" : ""}`}
      >
        <div className="content-wrapper">
          <h1 className="title">Weather</h1>
          <div className="header">
            <div ref={searchContainerRef} className="search-container">
              <input
                type="text"
                value={city}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                placeholder="Enter city"
                className="city-input"
              />
              {!loading && (
                <>
            <button onClick={getWeather} className="weather-button">
              <img alt='weather-img'className='weather-img' src='https://www.svgrepo.com/show/7109/search.svg'></img>
            </button>
                      <href className="location" onClick={handleUseMyLocation}>Use My Location</href>
</>
          )}
              {suggestions.length > 0 && showSuggestions && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {errorMessage && <p className="weather-info">{errorMessage}</p>}
          {loading && <OrbitProgress variant="track-disc" color="#56667e" />}
          
        
      </div>
      <div className="weather-i">
      {!loading && weather && (
            <div className={`weather-info ${animate ? "animate" : ""}`}>
              <h2>{weather.name}</h2>
              {weather.weather && weather.weather[0] && (
                <div className="weather-content">
                  {clear && !night && (
                    <img className="image" alt="Clear sky" src={image} />
                  )}
                  {cloudy && !rain && (
                    <img className="image" alt="Cloudy" src={cloud} />
                  )}
                  {night && clear && <WiMoonWaxingCrescent3 className='image' color="#aebe16" />}
                  {rain && <WiRainMix className='image' size={32} color="#428ee6" />}
                  <p>{weather.weather[0].description}</p>
                </div>
              )}
              {weather.main ? (
                <div className="temperature-container">
                  {hot && <WiThermometer size={34} color="#e04b4b" />}
                  {!hot && <WiThermometer size={34} color="#428ee6" />}
                  <span className="temp">{temp}°F</span>
                </div>
              ) : (
                <p>Please Enter a valid City Name</p>
              )}
              {weather.main ? (
                <div className="temperature-container">
                  <WiThermometer size={34} color="#e04b4b" />
                  <span className="space">H: {tempMax}°F</span>
                  <WiThermometer size={34} color="#428ee6" />
                  <span className="temp1">L: {tempMin}°F</span>
                </div>
              ) : (
                <p>Please Enter a valid City Name</p>
              )}
            </div>
          )}
        </div>
        </div>
      )}
    </>
  );
}

export default App;
