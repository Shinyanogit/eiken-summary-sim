import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function clampScore(val: string | null): number {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(8, Math.round(n)));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const c = clampScore(searchParams.get("c"));
  const o = clampScore(searchParams.get("o"));
  const v = clampScore(searchParams.get("v"));
  const g = clampScore(searchParams.get("g"));
  const total = c + o + v + g;
  const passed = total >= 24;

  let fontData: ArrayBuffer | undefined;
  try {
    const fontUrl =
      "https://rawcdn.githack.com/googlefonts/noto-cjk/refs/heads/main/Sans/SubsetOTF/JP/NotoSansJP-Bold.otf";
    const fontRes = await fetch(fontUrl);
    if (fontRes.ok) {
      fontData = await fontRes.arrayBuffer();
    }
  } catch {
    // Font fetch failed, continue without custom font
  }

  const scores = [
    { label: "内容", key: "Content", value: c },
    { label: "構成", key: "Organization", value: o },
    { label: "語彙", key: "Vocabulary", value: v },
    { label: "文法", key: "Grammar", value: g },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDF8F0",
          fontFamily: fontData ? "NotoSansJP" : "sans-serif",
          position: "relative",
        }}
      >
        {/* Border frame */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            right: "16px",
            bottom: "16px",
            border: "4px solid #003399",
            borderRadius: "8px",
            display: "flex",
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#003399",
              letterSpacing: "-1px",
            }}
          >
            英険1級 要約シュミレーター
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "#666",
            marginBottom: "36px",
            display: "flex",
          }}
        >
          採点結果
        </div>

        {/* Score cards row */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "36px",
          }}
        >
          {scores.map((s) => (
            <div
              key={s.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "white",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px 32px",
                minWidth: "160px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  color: "#666",
                  marginBottom: "4px",
                  display: "flex",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: "#999",
                  marginBottom: "8px",
                  display: "flex",
                }}
              >
                {s.key}
              </div>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#003399",
                  display: "flex",
                }}
              >
                {s.value}
                <span
                  style={{
                    fontSize: "24px",
                    color: "#999",
                    alignSelf: "flex-end",
                    marginLeft: "4px",
                    paddingBottom: "6px",
                  }}
                >
                  /8
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total + badge row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* Total */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "24px", color: "#333", display: "flex" }}>
              合計
            </span>
            <span
              style={{
                fontSize: "64px",
                fontWeight: 700,
                color: "#003399",
                display: "flex",
              }}
            >
              {total}
            </span>
            <span style={{ fontSize: "28px", color: "#999", display: "flex" }}>
              / 32
            </span>
          </div>

          {/* Pass/Fail badge */}
          <div
            style={{
              display: "flex",
              padding: "12px 32px",
              borderRadius: "8px",
              fontSize: "28px",
              fontWeight: 700,
              background: passed ? "#FEF3C7" : "#F3F4F6",
              color: passed ? "#92400E" : "#6B7280",
              border: passed
                ? "2px solid #FCD34D"
                : "2px solid #D1D5DB",
            }}
          >
            {passed ? "合格" : "不合格"}
          </div>
        </div>

        {/* Footer hint */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "18px",
            color: "#999",
            display: "flex",
          }}
        >
          合格ライン: 24点以上
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fontData
        ? {
            fonts: [
              {
                name: "NotoSansJP",
                data: fontData,
                style: "normal" as const,
                weight: 700 as const,
              },
            ],
          }
        : {}),
    },
  );
}
