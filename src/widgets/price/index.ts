import { ShoppingCart } from "lucide-react";
import type { Widget } from "../_types";
import { fetchPrice } from "./fetch";
import { PriceRender } from "./Render";
import type { PriceData } from "./schema";

export const priceWidget: Widget<PriceData> = {
  id: "price",
  title: "농수산물 시세",
  icon: ShoppingCart,
  category: "view",
  fetch: fetchPrice,
  Render: PriceRender,
};
