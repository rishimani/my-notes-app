import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Get search params from the request URL
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const city = searchParams.get("city");

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.error("OpenWeather API key is not defined");
    return NextResponse.json(
      { error: "Weather service not configured" },
      { status: 500 }
    );
  }

  try {
    let url;

    // If we have coordinates, use them; otherwise, use the city name
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    } else {
      return NextResponse.json(
        { error: "Missing location parameters" },
        { status: 400 }
      );
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Return only the data we need to minimize payload size
    return NextResponse.json({
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      location: data.name,
    });
  } catch (error) {
    console.error("Error fetching weather:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
