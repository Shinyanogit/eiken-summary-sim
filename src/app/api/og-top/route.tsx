import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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

        {/* Grade badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#003399",
              color: "white",
              width: "56px",
              height: "56px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              fontStyle: "italic",
            }}
          >
            4
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#666",
              display: "flex",
            }}
          >
            English Summary
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#003399",
            letterSpacing: "-1px",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          英険1級 要約シュミレーター
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#555",
            marginBottom: "48px",
            display: "flex",
          }}
        >
          あなたは0点を回避できるか？
        </div>

        {/* Score preview cards */}
        <div
          style={{
            display: "flex",
            gap: "20px",
          }}
        >
          {["内容", "構成", "語彙", "文法"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "white",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px 36px",
              }}
            >
              <div style={{ fontSize: "20px", color: "#666", marginBottom: "8px", display: "flex" }}>
                {label}
              </div>
              <div style={{ fontSize: "40px", fontWeight: 700, color: "#003399", display: "flex" }}>
                ?
                <span style={{ fontSize: "20px", color: "#999", alignSelf: "flex-end", marginLeft: "4px", paddingBottom: "4px" }}>
                  /8
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "16px",
            color: "#aaa",
            display: "flex",
          }}
        >
          ※ このサイトはジョークです
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
