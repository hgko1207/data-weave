import Link from "next/link";
import { Settings as SettingsIcon } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { DashboardHome } from "@/components/dashboard-home";

export default function DashboardPage() {
  return (
    <PageFrame
      eyebrow="dashboard"
      title="오늘의 한국 공공데이터"
      description="즐겨찾는 위젯으로 빠르게 이동하고, 카테고리별 전체 위젯을 둘러보세요."
      actions={
        <Link
          href="/settings"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <SettingsIcon className="h-3.5 w-3.5" />
          위젯 관리
        </Link>
      }
    >
      <DashboardHome />
    </PageFrame>
  );
}
