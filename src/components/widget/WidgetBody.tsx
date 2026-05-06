type Props = { children: React.ReactNode };

export function WidgetBody({ children }: Props) {
  return <div className="mt-4">{children}</div>;
}
