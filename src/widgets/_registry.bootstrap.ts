import { getWidget, registerWidget } from "./_registry";
import { weatherWidget } from "./weather";
import { pharmacyWidget } from "./pharmacy";
import { foodRecallWidget } from "./food-recall";

export function bootstrapWidgets(): void {
  if (!getWidget(weatherWidget.id)) registerWidget(weatherWidget);
  if (!getWidget(pharmacyWidget.id)) registerWidget(pharmacyWidget);
  if (!getWidget(foodRecallWidget.id)) registerWidget(foodRecallWidget);
}
