import Link from "next/link";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const widgets: Array<{ id: string; title: string }> = [];

  if (widgets.length === 0) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">
          DataWeave
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
          어떤 데이터를 받아볼까요?
        </h1>
        <p className="mt-3 max-w-md text-sm text-zinc-400">
          날씨, SOS 병원, 식품 리콜. 한국 공공데이터 위젯을 한 화면에 모아보세요.
        </p>
        <Link
          href="/catalog"
          className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <Plus className="h-4 w-4" />첫 위젯 추가
        </Link>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {/* widgets render here in Step 2+ */}
    </section>
  );
}
