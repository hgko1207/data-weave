import { Ticket } from "lucide-react";
import type { Widget } from "../_types";
import { fetchLotto } from "./fetch";
import { LottoRender } from "./Render";
import type { LottoData } from "./schema";

export const lottoWidget: Widget<LottoData> = {
  id: "lotto",
  title: "로또",
  icon: Ticket,
  category: "view",
  fetch: fetchLotto,
  Render: LottoRender,
};
