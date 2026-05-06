import type { Widget } from "./_types";

const registry = new Map<string, Widget>();

export function registerWidget<T>(widget: Widget<T>): void {
  if (registry.has(widget.id)) {
    throw new Error(`Widget already registered: ${widget.id}`);
  }
  registry.set(widget.id, widget as Widget);
}

export function getWidget(id: string): Widget | undefined {
  return registry.get(id);
}

export function listWidgets(): Widget[] {
  return Array.from(registry.values());
}
