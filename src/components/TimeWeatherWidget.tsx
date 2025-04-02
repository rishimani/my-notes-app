"use client";

import { useState, useEffect } from "react";

interface Weather {
  temp: number;
  condition: string;
  icon: string;
  location: string;
}

export default function TimeWeatherWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<Weather | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update time every second
  useEffect(() => {
    // Set the initial time immediately
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Try to get location and fetch weather, otherwise use a fallback
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          // If geolocation fails, use a default location (New York)
          fetchWeatherByCity("New York");
        },
        { timeout: 10000 } // 10 second timeout for geolocation
      );
    } else {
      console.error("Geolocation is not supported by this browser");
      // Use a default location
      fetchWeatherByCity("New York");
    }

    return () => clearInterval(timer);
  }, []);

  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      setError(null);
      // Use our API route instead of calling OpenWeather directly
      const response = await fetch(
        `/api/weather?lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setWeather({
        temp: data.temp,
        condition: data.condition,
        icon: data.icon,
        location: data.location,
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
      setError("Could not fetch weather data");
      // Try with a default city as fallback
      fetchWeatherByCity("New York");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherByCity = async (city: string) => {
    // Don't try a fallback if we're already trying one
    if (error === "Fallback error") return;

    try {
      setIsLoading(true);
      setError(null);

      // Use our API route instead of calling OpenWeather directly
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setWeather({
        temp: data.temp,
        condition: data.condition,
        icon: data.icon,
        location: data.location,
      });
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      setError("Fallback error");
      // Create mock weather data as a last resort
      setWeather({
        temp: 22,
        condition: "Unknown",
        icon: "01d",
        location: "Location Unavailable",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format time as HH:MM:SS AM/PM with a more beautiful format
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Add leading zeros
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const ampm = hours >= 12 ? "pm" : "am";

    // Return time in a more elegant format
    return (
      <div className="flex items-baseline">
        <span className="text-5xl">{formattedHours}</span>
        <span className="text-5xl">:</span>
        <span className="text-5xl">{formattedMinutes}</span>
        <span className="text-4xl text-gray-400">:</span>
        <span className="text-4xl text-gray-400">{formattedSeconds}</span>
        <span className="ml-2 text-2xl text-gray-400 lowercase">{ampm}</span>
      </div>
    );
  };

  // Format date as "Day, Month DD, YYYY" with a more elegant look
  const formatDate = (date: Date) => {
    // Use explicit locale and format options to ensure consistency between server and client
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Weather icon mapping to cleaner SVG-based icons
  const getWeatherIcon = (iconCode: string) => {
    // Get the general category from the icon code
    const isDay = iconCode.endsWith("d");
    const category = iconCode.substring(0, 2);

    // Create common SVG attributes for all icons
    const svgClassNames = "w-12 h-12"; // Larger icons

    // Return the appropriate SVG icon
    switch (category) {
      case "01": // clear sky
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${svgClassNames} ${
              isDay ? "text-yellow-300" : "text-blue-200"
            }`}
          >
            {isDay ? (
              <>
                {" "}
                {/* Sun */}
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </>
            ) : (
              <>
                {" "}
                {/* Moon */}
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </>
            )}
          </svg>
        );

      case "02": // few clouds
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${svgClassNames} text-blue-200`}
          >
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            {isDay && (
              <circle
                cx="5"
                cy="5"
                r="2.5"
                className="text-yellow-300"
                fill="currentColor"
              />
            )}
          </svg>
        );

      case "03": // scattered clouds
      case "04": // broken clouds
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${svgClassNames} text-gray-300`}
          >
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
          </svg>
        );

      case "09": // shower rain
      case "10": // rain
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${svgClassNames} text-blue-300`}
          >
            <path d="M20 16.2A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path>
            <path d="M13 11l-4 6"></path>
            <path d="M11 15l-2 3"></path>
            <path d="M15 12l-3 4.5"></path>
          </svg>
        );

      case "11": // thunderstorm
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${svgClassNames} text-yellow-400`}
          >
            <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path>
            <path d="M13 11l-4 6h6l-4 6"></path>
          </svg>
        );

      case "13": // snow
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${svgClassNames} text-white`}
          >
            <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
            <path d="M8 16h.01"></path>
            <path d="M8 20h.01"></path>
            <path d="M12 18h.01"></path>
            <path d="M12 22h.01"></path>
            <path d="M16 16h.01"></path>
            <path d="M16 20h.01"></path>
          </svg>
        );

      case "50": // mist
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${svgClassNames} text-gray-400`}
          >
            <path d="M5 5h14"></path>
            <path d="M5 9h14"></path>
            <path d="M5 13h14"></path>
            <path d="M5 17h14"></path>
          </svg>
        );

      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${svgClassNames} text-gray-400`}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
    }
  };

  return (
    <div className="bg-transparent py-2 mb-2">
      <div className="flex flex-col md:flex-row justify-between items-center">
        {/* Time and Date - Centered with larger size */}
        <div className="text-center md:text-left w-full md:w-auto mb-6 md:mb-0">
          <div className="font-serif font-semibold text-white tracking-tight">
            {formatTime(currentTime)}
          </div>
          <div className="text-xl text-gray-300 font-light mt-1 tracking-wide">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Weather - With gradient effect */}
        <div className="flex items-center justify-center md:justify-end">
          {isLoading ? (
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
            </div>
          ) : weather ? (
            <div className="text-right flex items-center bg-gradient-to-r from-transparent via-gray-900/30 to-gray-900/30 backdrop-blur-sm rounded-full py-3 px-5 shadow-lg">
              <div className="flex-shrink-0 mr-4">
                {getWeatherIcon(weather.icon)}
              </div>
              <div>
                <div className="flex items-center justify-end">
                  <span className="text-4xl text-white font-semibold">
                    {weather.temp}°
                  </span>
                  <span className="text-gray-400 text-xl ml-1">C</span>
                </div>
                <div className="text-gray-300 text-lg">{weather.condition}</div>
                <div className="text-gray-400 text-sm">{weather.location}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">
              {error || "Weather unavailable"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
