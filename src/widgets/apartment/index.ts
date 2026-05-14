import { Building2 } from "lucide-react";
import type { Widget } from "../_types";
import { fetchApartment } from "./fetch";
import { ApartmentRender } from "./Render";
import { ApartmentConfigForm } from "./ConfigForm";
import type { ApartmentData } from "./schema";

export const apartmentWidget: Widget<ApartmentData> = {
  id: "apartment",
  title: "아파트 실거래가",
  icon: Building2,
  category: "view",
  fetch: fetchApartment,
  Render: ApartmentRender,
  ConfigForm: ApartmentConfigForm,
};
