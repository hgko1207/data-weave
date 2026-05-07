import { ShieldAlert } from "lucide-react";
import type { Widget } from "../_types";
import { fetchFoodRecall } from "./fetch";
import { FoodRecallRender } from "./Render";
import { FoodRecallConfigForm } from "./ConfigForm";
import type { FoodRecallData } from "./schema";

export const foodRecallWidget: Widget<FoodRecallData> = {
  id: "food-recall",
  title: "식품 리콜",
  icon: ShieldAlert,
  category: "view",
  fetch: fetchFoodRecall,
  Render: FoodRecallRender,
  ConfigForm: FoodRecallConfigForm,
};
