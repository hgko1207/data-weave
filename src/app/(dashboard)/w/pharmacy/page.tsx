import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import {
  PharmacyFilters,
  type PharmacyFilterValues,
} from "@/components/widget/pharmacy/PharmacyFilters";
import { PharmacyDetail } from "@/components/widget/pharmacy/PharmacyDetail";
import { fetchPharmacy } from "@/widgets/pharmacy/fetch";
import { getSidoCenter } from "@/widgets/pharmacy/sido-centers";
import { sosDataSchema, type SosData } from "@/widgets/pharmacy/schema";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const ALLOWED_RADIUS = new Set([3, 5, 10, 20]);

type Props = {
  searchParams: Promise<{
    sido?: string;
    sigungu?: string;
    radius?: string;
    kind?: string;
  }>;
};

export default async function PharmacyDetailPage({ searchParams }: Props) {
  const params = await searchParams;
  const sido = params.sido?.trim() || "대전광역시";
  const sigungu = params.sigungu?.trim() || "유성구";
  const radiusNum = Number(params.radius);
  const radius = ALLOWED_RADIUS.has(radiusNum) ? radiusNum : 5;
  const kindRaw = params.kind ?? "all";
  const kind: PharmacyFilterValues["kind"] =
    kindRaw === "pharmacy" || kindRaw === "er" ? kindRaw : "all";

  const center = getSidoCenter(sido);

  let data: SosData;
  let errorMessage: string | undefined;
  try {
    data = await fetchPharmacy({
      config: {
        v: 1,
        sido,
        sigungu,
        lat: center.lat,
        lng: center.lng,
        radiusKm: radius,
      },
      abort: new AbortController().signal,
      now: new Date(),
    });
  } catch (err) {
    logger.warn("pharmacy detail page fetch failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
    data = sosDataSchema.parse({
      region: `${sido} ${sigungu}`,
      queriedAt: new Date().toISOString(),
      list: [],
      radiusKm: radius,
      origin: center,
      source: "mock",
    });
  }

  return (
    <PageFrame
      eyebrow="widget · pharmacy"
      title={`SOS 병원·약국 · ${sido} ${sigungu}`}
      description="야간·공휴일 운영 약국 + 응급실. 시·도/시·군·구 검색, 반경 조절, 카카오맵 연결."
      actions={
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          대시보드
        </Link>
      }
    >
      <PharmacyFilters
        current={{ sido, sigungu, radius, kind }}
      />

      {errorMessage ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-200">
          데이터를 불러오지 못했습니다: <span className="font-mono">{errorMessage}</span>
        </div>
      ) : null}

      <PharmacyDetail data={data} kindFilter={kind} />
    </PageFrame>
  );
}
