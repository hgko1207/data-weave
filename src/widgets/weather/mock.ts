import type { WeatherData } from "./schema";

export function buildMockWeather(region: string): WeatherData {
  const now = new Date();
  const observedAt = now.toISOString();
  const hourly = Array.from({ length: 6 }, (_, i) => {
    const t = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hh = String(t.getHours()).padStart(2, "0");
    return {
      time: `${hh}:00`,
      temp: -3.2 + i * 0.4,
      pop: i === 0 ? 20 : i < 3 ? 30 : 10,
    };
  });

  return {
    region,
    observedAt,
    temp: -3.2,
    feelsLike: -6.1,
    pop: 20,
    skyText: "흐림",
    pm10Value: 45,
    pm10Grade: "보통",
    pm25Value: 18,
    pm25Grade: "보통",
    hourly,
    source: "mock",
  };
}
