import type { WeatherData, DailyPoint } from "./schema";

export function buildMockWeather(region: string): WeatherData {
  const now = new Date();
  const observedAt = now.toISOString();

  const hourly = Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hh = String(t.getHours()).padStart(2, "0");
    const pop = i % 7 < 2 ? 30 : 10;
    return {
      time: `${hh}:00`,
      temp: -3.2 + Math.sin(i / 3) * 4,
      pop,
      skyText: pop >= 30 ? "흐림" : i % 4 === 0 ? "구름많음" : "맑음",
    };
  });

  const todayHigh = Math.max(...hourly.map((h) => h.temp));
  const todayLow = Math.min(...hourly.map((h) => h.temp));

  const labels = ["오늘", "내일", "모레", "수요일", "목요일", "금요일", "토요일"];
  const daily: DailyPoint[] = labels.map((label, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const high = todayHigh - i + Math.sin(i) * 1.5;
    const low = todayLow - i * 0.6 + Math.cos(i) * 1.2;
    return {
      dayOffset: i,
      label,
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      high: Math.round(high * 10) / 10,
      low: Math.round(low * 10) / 10,
      skyText: i % 3 === 0 ? "맑음" : i % 3 === 1 ? "구름많음" : "흐림",
      pop: i === 1 ? 60 : 20,
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
    humidity: 73,
    windSpeed: 3.2,
    windDirection: 225,
    windDirectionLabel: "남서",
    precipitation: 0,
    todayHigh,
    todayLow,
    hourly,
    daily,
    source: "mock",
  };
}
