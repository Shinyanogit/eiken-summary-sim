import type { Metadata } from "next";

function clampScore(val: string | undefined): number {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(8, Math.round(n)));
}

type Props = {
  searchParams: Promise<{ c?: string; o?: string; v?: string; g?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const c = clampScore(params.c);
  const o = clampScore(params.o);
  const v = clampScore(params.v);
  const g = clampScore(params.g);
  const total = c + o + v + g;
  const passed = total >= 24;
  const verdict = passed ? "合格" : "不合格";

  const ogImageUrl = `/api/og?c=${c}&o=${o}&v=${v}&g=${g}`;
  const title = `${total}/32点（${verdict}）- 英険1級 要約シュミレーター`;
  const description = `内容${c} 構成${o} 語彙${v} 文法${g} = 合計${total}/32点（${verdict}）`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const c = clampScore(params.c);
  const o = clampScore(params.o);
  const v = clampScore(params.v);
  const g = clampScore(params.g);
  const total = c + o + v + g;
  const passed = total >= 24;

  const scores = [
    { label: "内容 (Content)", value: c },
    { label: "構成 (Organization)", value: o },
    { label: "語彙 (Vocabulary)", value: v },
    { label: "文法 (Grammar)", value: g },
  ];

  return (
    <div className="bg-white border border-gray-200 p-8 md:p-12 max-w-2xl mx-auto">
      <h1
        className="text-xl font-bold mb-6 pb-3 border-b-2 text-center"
        style={{ borderColor: "var(--eiken-navy)", color: "var(--eiken-navy)" }}
      >
        採点結果
      </h1>

      {/* Pass/Fail badge */}
      <div className="text-center mb-8">
        {passed ? (
          <span className="inline-block px-6 py-2 text-lg font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">
            合格（{total}/32点）
          </span>
        ) : (
          <span className="inline-block px-6 py-2 text-lg font-bold rounded bg-gray-100 text-gray-600 border border-gray-300">
            不合格（{total}/32点）
          </span>
        )}
      </div>

      {/* Score table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "var(--eiken-navy)" }}>
              <th className="text-white text-sm py-2 px-4 text-left">観点</th>
              <th className="text-white text-sm py-2 px-4 text-center">スコア</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.label} className="border-b border-gray-200">
                <td className="py-2 px-4 text-sm text-gray-700">{s.label}</td>
                <td className="py-2 px-4 text-center font-bold" style={{ color: "var(--eiken-navy)" }}>
                  {s.value} / 8
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold">
              <td className="py-2 px-4 text-sm">合計</td>
              <td className="py-2 px-4 text-center" style={{ color: "var(--eiken-navy)" }}>
                {total} / 32
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className="text-center">
        <a
          href="/"
          className="inline-block px-8 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          style={{ background: "var(--eiken-navy)" }}
        >
          自分も挑戦する
        </a>
      </div>
    </div>
  );
}
