import { Pill } from "lucide-react";
import type { Widget } from "../_types";
import { fetchPharmacy } from "./fetch";
import { PharmacyRender } from "./Render";
import { PharmacyConfigForm } from "./ConfigForm";
import type { SosData } from "./schema";

export const pharmacyWidget: Widget<SosData> = {
  id: "pharmacy",
  title: "SOS 병원·약국",
  icon: Pill,
  category: "view",
  fetch: fetchPharmacy,
  Render: PharmacyRender,
  ConfigForm: PharmacyConfigForm,
};
