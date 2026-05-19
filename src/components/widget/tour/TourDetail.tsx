import {
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  MapPinned,
  Mountain,
  Palette,
  PartyPopper,
  Phone,
  ShoppingBag,
  Tent,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TourData, TourItem } from "@/widgets/tour/schema";

const CATEGORY_META: Record<
  TourItem["category"],
  { label: string; icon: LucideIcon; tone: string; accent: string }
> = {
  nature: {
    label: "자연",
    icon: Mountain,
    tone: "text-emerald-300",
    accent: "bg-emerald-500/15 text-emerald-300",
  },
  culture: {
    label: "문화",
    icon: Palette,
    tone: "text-cyan-300",
    accent: "bg-cyan-500/15 text-cyan-300",
  },
  festival: {
    label: "축제",
    icon: PartyPopper,
    tone: "text-amber-300",
    accent: "bg-amber-500/15 text-amber-300",
  },
  leisure: {
    label: "레저",
    icon: Tent,
    tone: "text-pink-300",
    accent: "bg-pink-500/15 text-pink-300",
  },
  shopping: {
    label: "쇼핑",
    icon: ShoppingBag,
    tone: "text-violet-300",
    accent: "bg-violet-500/15 text-violet-300",
  },
};

export function TourDetail({ data }: { data: TourData }) {
  if (data.items.length === 0) {
    return (
      <article className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-12 text-center">
        <MapPinned className="mx-auto h-7 w-7 text-zinc-500" aria-hidden />
        <p className="mt-3 text-base font-medium text-zinc-100">
          조건에 맞는 장소가 없어요
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          다른 시·군·구를 선택하거나 카테고리를 풀어보세요.
        </p>
      </article>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          {data.region}
        </span>
        <span className="font-mono text-xs text-zinc-500">·</span>
        <span className="font-mono text-xs tabular-nums text-emerald-300">
          {data.total}곳
        </span>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((it) => (
          <TourCard key={it.id} item={it} />
        ))}
      </ul>

      {data.source === "mock" ? (
        <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
          mock · API 키 등록 시 실 데이터로 전환
        </p>
      ) : null}
    </div>
  );
}

function TourCard({ item }: { item: TourItem }) {
  const meta = CATEGORY_META[item.category];
  const Icon = meta.icon;
  const mapHref = `https://map.kakao.com/?q=${encodeURIComponent(`${item.title} ${item.address}`)}`;

  return (
    <li className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 transition hover:border-zinc-700">
      {/* 이미지 영역 — imageUrl 있으면 <img>, 없으면 카테고리 아이콘 placeholder */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-zinc-950/60">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageIcon className="h-8 w-8 text-zinc-700" aria-hidden />
        )}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${meta.accent}`}
        >
          <Icon className="h-3 w-3" aria-hidden />
          {meta.label}
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate text-base font-medium text-zinc-100">{item.title}</h3>
        <p className="mt-1 truncate text-xs text-zinc-500">{item.address}</p>

        {item.overview ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">
            {item.overview}
          </p>
        ) : null}

        {item.startDate && item.endDate ? (
          <p className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-amber-300">
            <Calendar className="h-3 w-3" aria-hidden />
            {item.startDate} ~ {item.endDate}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <a
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 font-mono text-xs text-emerald-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/15"
          >
            <MapPin className="h-3 w-3" aria-hidden />
            카카오맵
            <ExternalLink className="h-3 w-3 text-emerald-400" aria-hidden />
          </a>
          {item.tel ? (
            <a
              href={`tel:${item.tel}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 font-mono text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
            >
              <Phone className="h-3 w-3" aria-hidden />
              {item.tel}
            </a>
          ) : null}
          {item.homepage ? (
            <a
              href={item.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 font-mono text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
            >
              홈페이지
              <ExternalLink className="h-3 w-3 text-zinc-500" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}
