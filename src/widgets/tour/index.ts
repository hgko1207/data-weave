import { MapPinned } from "lucide-react";
import type { Widget } from "../_types";
import { fetchTour } from "./fetch";
import { TourRender } from "./Render";
import type { TourData } from "./schema";

export const tourWidget: Widget<TourData> = {
  id: "tour",
  title: "관광·전시",
  icon: MapPinned,
  category: "view",
  fetch: fetchTour,
  Render: TourRender,
};
