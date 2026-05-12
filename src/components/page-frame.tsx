type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function PageFrame({ eyebrow, title, description, actions, children }: Props) {
  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="font-mono text-xs font-semibold uppercase leading-none tracking-[0.16em] text-emerald-400">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-zinc-100">
            {title}
          </h1>
          {description ? (
            <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
