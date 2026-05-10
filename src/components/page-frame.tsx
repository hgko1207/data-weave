type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function PageFrame({ eyebrow, title, description, actions, children }: Props) {
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-5">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="font-mono text-[11px] uppercase leading-none tracking-[0.18em] text-emerald-400/80">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-[1.625rem] font-semibold leading-tight tracking-tight text-zinc-100 md:text-[2rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-zinc-400">
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
