import { Siren } from "lucide-react";
import type { Widget } from "../_types";
import { fetchDisaster } from "./fetch";
import { DisasterRender } from "./Render";
import type { DisasterData } from "./schema";

export const disasterWidget: Widget<DisasterData> = {
  id: "disaster",
  title: "재난문자",
  icon: Siren,
  category: "view",
  fetch: fetchDisaster,
  Render: DisasterRender,
};
