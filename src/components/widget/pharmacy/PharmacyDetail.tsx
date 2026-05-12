import { MapPin, Phone, Pill, Stethoscope } from "lucide-react";
import type { Facility, SosData } from "@/widgets/pharmacy/schema";

export function PharmacyDetail({
  data,
  kindFilter,
}: {
  data: SosData;
  kindFilter: "all" | "pharmacy" | "er";
}) {
  const filtered =
    kindFilter === "all" ? data.list : data.list.filter((f) => f.kind === kindFilter);
  const pharmacyCount = data.list.filter((f) => f.kind === "pharmacy").length;
  const erCount = data.list.filter((f) => f.kind === "er").length;

  return (
    <article className="rounded-xl border border-zinc-800/80 bg-zinc-900">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-zinc-800/80 px-6 py-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-base font-semibold text-zinc-100">{data.region}</h2>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
            반경 {data.radiusKm}km
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <CountLine label="전체" value={data.list.length} color="text-zinc-100" />
          <CountLine label="약국" value={pharmacyCount} color="text-emerald-300" />
          <CountLine label="응급실" value={erCount} color="text-cyan-300" />
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-zinc-300">
            {kindFilter === "all"
              ? "반경 내 운영 중인 곳이 없어요."
              : kindFilter === "pharmacy"
              ? "반경 내 약국이 없어요."
              : "반경 내 응급실이 없어요."}
          </p>
          <p className="mt-1 text-xs text-zinc-500">시·군·구나 반경을 넓혀보세요.</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800/60">
          {filtered.map((f) => (
            <FacilityCard
              key={`${f.kind}-${f.name}-${f.lat.toFixed(4)}`}
              facility={f}
            />
          ))}
        </ul>
      )}

      {data.source === "mock" ? (
        <p className="border-t border-zinc-800/80 px-6 py-3 font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </article>
  );
}

function CountLine({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={`font-mono text-base font-semibold tabular-nums ${color}`}>
        {value}
      </span>
    </span>
  );
}

function FacilityCard({ facility }: { facility: Facility }) {
  const Icon = facility.kind === "pharmacy" ? Pill : Stethoscope;
  const iconColor =
    facility.kind === "pharmacy"
      ? "bg-emerald-500/15 text-emerald-400"
      : "bg-cyan-500/15 text-cyan-400";
  const kindLabel = facility.kind === "pharmacy" ? "약국" : "응급실";
  const kakaoUrl = `https://map.kakao.com/link/map/${encodeURIComponent(
    facility.name,
  )},${facility.lat},${facility.lng}`;

  return (
    <li className="flex items-start gap-4 px-6 py-4">
      <span
        aria-hidden
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${iconColor}`}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
            {kindLabel}
          </span>
          <h3 className="text-base font-medium text-zinc-100">{facility.name}</h3>
          <span className="ml-auto shrink-0 font-mono text-sm font-semibold tabular-nums text-zinc-200">
            {facility.distanceKm.toFixed(1)}km
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-zinc-400">{facility.address}</p>
        {facility.hoursToday ? (
          <p className="mt-1 font-mono text-xs text-zinc-500">
            오늘 {facility.hoursToday}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {facility.phone ? (
            <a
              href={`tel:${facility.phone.replace(/\D+/g, "")}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              <span className="font-mono tabular-nums">{facility.phone}</span>
            </a>
          ) : null}
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            카카오맵
          </a>
        </div>
      </div>
    </li>
  );
}
