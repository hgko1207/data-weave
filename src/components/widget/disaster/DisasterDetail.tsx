import Link from "next/link";
import { Siren, AlertTriangle, Info, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DisasterData, DisasterMessage, EmergencyLevel } from "@/widgets/disaster/schema";

const LEVEL_META: Record<
  EmergencyLevel,
  { label: string; icon: LucideIcon; dot: string; chip: string; bar: string }
> = {
  critical: {
    label: "위급",
    icon: Siren,
    dot: "bg-rose-400",
    chip: "bg-rose-500/15 text-rose-300",
    bar: "bg-rose-500/60",
  },
  emergency: {
    label: "긴급",
    icon: AlertTriangle,
    dot: "bg-amber-400",
    chip: "bg-amber-500/15 text-amber-300",
    bar: "bg-amber-500/60",
  },
  info: {
    label: "안내",
    icon: Info,
    dot: "bg-cyan-400",
    chip: "bg-cyan-500/15 text-cyan-300",
    bar: "bg-cyan-500/50",
  },
};

export function DisasterDetail({ data }: { data: DisasterData }) {
  return (
    <div className="space-y-5">
      <StatsRow data={data} />

      {data.messages.length === 0 ? (
        <EmptyState region={data.region} windowHours={data.windowHours} />
      ) : (
        <Timeline messages={data.messages} />
      )}

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
          mock · 활용신청 후 행정안전부 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({ region, windowHours }: { region: string; windowHours: number }) {
  const isNationwide = region.startsWith("전국");
  const nationwideHref = `/w/disaster?sido=${encodeURIComponent("전국")}&window=${windowHours}`;
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-10 text-center">
      <Siren className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
      <p className="mt-3 text-base font-medium text-zinc-100">
        {region}에 최근 {windowHours}시간 재난문자가 없어요
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        평온한 상태입니다. 기간을 늘리거나 다른 지역을 선택해보세요.
      </p>
      {!isNationwide ? (
        <Link
          href={nationwideHref}
          className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-medium text-emerald-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <Globe className="h-3.5 w-3.5" aria-hidden />
          전국 메시지 보기
        </Link>
      ) : null}
    </article>
  );
}

function StatsRow({ data }: { data: DisasterData }) {
  const critical = data.messages.filter((m) => m.level === "critical").length;
  const emergency = data.messages.filter((m) => m.level === "emergency").length;
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        icon={<Siren className="h-4 w-4" aria-hidden />}
        label="위급"
        value={`${critical}`}
        accent="bg-rose-500/15 text-rose-400"
        valueClass="text-rose-200"
      />
      <StatCard
        icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
        label="긴급"
        value={`${emergency}`}
        accent="bg-amber-500/15 text-amber-400"
        valueClass="text-amber-200"
      />
      <StatCard
        icon={<Info className="h-4 w-4" aria-hidden />}
        label="전체"
        value={`${data.total}`}
        accent="bg-zinc-800 text-zinc-300"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  valueClass?: string;
}) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-4">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={`flex h-9 w-9 items-center justify-center rounded-md ${accent}`}
        >
          {icon}
        </span>
        <span className="text-sm font-medium text-zinc-300">{label}</span>
      </div>
      <p
        className={`mt-3 font-mono text-2xl font-semibold tracking-tight ${
          valueClass ?? "text-zinc-100"
        }`}
      >
        {value}
      </p>
    </article>
  );
}

function Timeline({ messages }: { messages: DisasterMessage[] }) {
  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <h2 className="text-base font-semibold text-zinc-100">재난문자 타임라인</h2>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400">
          {messages.length}건 · 최신순
        </p>
      </header>
      <ul className="divide-y divide-zinc-800/60">
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
      </ul>
    </article>
  );
}

function MessageRow({ message }: { message: DisasterMessage }) {
  const meta = LEVEL_META[message.level];
  const Icon = meta.icon;
  return (
    <li className="flex gap-3.5 px-6 py-4">
      {/* 긴급단계 좌측 바 + 아이콘 */}
      <div className="flex shrink-0 flex-col items-center">
        <span className={`flex h-8 w-8 items-center justify-center rounded-md ${meta.chip}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className={`mt-1 w-0.5 flex-1 rounded-full ${meta.bar}`} aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${meta.chip}`}>
            {meta.label}
          </span>
          <span className="text-sm font-medium text-zinc-100">{message.disasterType}</span>
          <span className="font-mono text-xs tabular-nums text-zinc-400">
            {formatSentAt(message.sentAt)}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{message.message}</p>
        <p className="mt-1 truncate text-xs text-zinc-400">{message.region}</p>
      </div>
    </li>
  );
}

function formatSentAt(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  const d = new Date(t);
  const now = Date.now();
  const diffMin = Math.round((now - t) / 60000);
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}시간 전`;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}.${dd} ${hh}:${mi}`;
}
