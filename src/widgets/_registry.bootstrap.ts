import { getWidget, registerWidget } from "./_registry";
import { weatherWidget } from "./weather";

export function bootstrapWidgets(): void {
  if (!getWidget(weatherWidget.id)) registerWidget(weatherWidget);
}
