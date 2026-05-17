import { getWidget, registerWidget } from "./_registry";
import { weatherWidget } from "./weather";
import { pharmacyWidget } from "./pharmacy";
import { foodRecallWidget } from "./food-recall";
import { apartmentWidget } from "./apartment";
import { rentWidget } from "./rent";

export function bootstrapWidgets(): void {
  if (!getWidget(weatherWidget.id)) registerWidget(weatherWidget);
  if (!getWidget(pharmacyWidget.id)) registerWidget(pharmacyWidget);
  if (!getWidget(foodRecallWidget.id)) registerWidget(foodRecallWidget);
  if (!getWidget(apartmentWidget.id)) registerWidget(apartmentWidget);
  if (!getWidget(rentWidget.id)) registerWidget(rentWidget);
}
