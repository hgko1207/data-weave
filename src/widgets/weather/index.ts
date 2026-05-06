import { CloudSun } from "lucide-react";
import type { Widget } from "../_types";
import { fetchWeather } from "./fetch";
import { WeatherRender } from "./Render";
import { WeatherConfigForm } from "./ConfigForm";
import type { WeatherData } from "./schema";

export const weatherWidget: Widget<WeatherData> = {
  id: "weather",
  title: "날씨",
  icon: CloudSun,
  category: "view",
  fetch: fetchWeather,
  Render: WeatherRender,
  ConfigForm: WeatherConfigForm,
};
