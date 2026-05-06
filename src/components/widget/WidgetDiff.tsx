type DiffKind = "added" | "removed" | "modified";

type Props = {
  kind: DiffKind;
  children: React.ReactNode;
};

const styles: Record<DiffKind, string> = {
  added: "text-emerald-400 bg-emerald-950/30 px-1.5 rounded",
  removed: "line-through text-zinc-500",
  modified: "text-amber-400 bg-amber-950/20 px-1.5 rounded",
};

const prefix: Record<DiffKind, string> = {
  added: "+",
  removed: "-",
  modified: "~",
};

export function WidgetDiff({ kind, children }: Props) {
  return (
    <span className={styles[kind]}>
      <span aria-hidden className="font-mono mr-0.5">
        {prefix[kind]}
      </span>
      {children}
    </span>
  );
}
