import { Key } from "lucide-react";
import type { Widget } from "../_types";
import { fetchRent } from "./fetch";
import { RentRender } from "./Render";
import { RentConfigForm } from "./ConfigForm";
import type { RentData } from "./schema";

export const rentWidget: Widget<RentData> = {
  id: "rent",
  title: "전월세 실거래가",
  icon: Key,
  category: "view",
  fetch: fetchRent,
  Render: RentRender,
  ConfigForm: RentConfigForm,
};
