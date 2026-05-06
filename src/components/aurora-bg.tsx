export function AuroraBg() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-zinc-950 to-black" />
      <div className="absolute -top-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-3xl" />
    </div>
  );
}
