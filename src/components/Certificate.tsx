"use client";

import { useRef, useMemo, useImperativeHandle, forwardRef, useEffect, useState } from "react";

interface CertificateProps {
  name?: string;
  content: number;
  organization: number;
  vocabulary: number;
  grammar: number;
  total: number;
  date: string;
}

export interface CertificateHandle {
  toBlob: () => Promise<Blob | null>;
}

const Certificate = forwardRef<CertificateHandle, CertificateProps>(function Certificate(
  { name, content, organization, vocabulary, grammar, total, date },
  ref
) {
  const certRef = useRef<HTMLDivElement>(null);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Load UnifrakturMaguntia + Noto Serif via Google Fonts
  useEffect(() => {
    if (document.getElementById("cert-fonts")) {
      setFontLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.id = "cert-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap";
    link.onload = () => setFontLoaded(true);
    document.head.appendChild(link);
  }, []);

  useImperativeHandle(ref, () => ({
    async toBlob() {
      if (!certRef.current) return null;
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: "#fdfdfb",
      });
      return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    },
  }));

  const certNo = useMemo(
    () => `9201-${Math.floor(Math.random() * 9000000 + 1000000)}`,
    []
  );
  const regNo = useMemo(
    () => `${Math.floor(Math.random() * 90000000 + 10000000)}`,
    []
  );

  async function handleDownload() {
    if (!certRef.current) return;
    const html2canvas = (await import("html2canvas-pro")).default;
    const canvas = await html2canvas(certRef.current, {
      scale: 2,
      backgroundColor: "#fdfdfb",
    });
    const link = document.createElement("a");
    link.download = "英険1級_合格証明書.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div>
      <div
        ref={certRef}
        className="mx-auto relative"
        style={{
          maxWidth: 700,
          backgroundColor: "#fdfdfb",
          border: "14px solid #d4d8e8",
          outline: "2px solid #5a6b9c",
          outlineOffset: "-10px",
          fontFamily: '"Noto Serif", Georgia, "Times New Roman", serif',
          padding: "36px 48px",
          position: "relative",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Eiken watermark */}
        <div
          className="absolute inset-0 overflow-hidden select-none pointer-events-none"
          style={{ opacity: 0.03 }}
        >
          {Array.from({ length: 24 }).map((_, row) => (
            <div
              key={row}
              className="whitespace-nowrap"
              style={{
                fontSize: "10px",
                letterSpacing: "5px",
                lineHeight: "18px",
                color: "#5a6b9c",
                fontWeight: 700,
                fontFamily: "sans-serif",
                paddingLeft: row % 2 === 0 ? "0px" : "36px",
              }}
            >
              {"Eiken ".repeat(50)}
            </div>
          ))}
        </div>

        {/* Content wrapper */}
        <div className="relative z-10">
          {/* Header row */}
          <div className="flex justify-between items-start mb-6">
            {/* Left: rosette + grade */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                {/* Rosette */}
                <svg width="52" height="52" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ellipse
                      key={i}
                      cx="30"
                      cy="30"
                      rx="7"
                      ry="17"
                      fill={i % 2 === 0 ? "#6878A0" : "#9AABC4"}
                      opacity={i % 2 === 0 ? 0.55 : 0.35}
                      transform={`rotate(${i * 30} 30 30)`}
                    />
                  ))}
                  <circle cx="30" cy="30" r="11" fill="#5a6b9c" />
                  <circle cx="30" cy="30" r="8.5" fill="#9AABC4" />
                  <circle cx="30" cy="30" r="6" fill="white" opacity="0.9" />
                </svg>
              </div>
              <div className="flex flex-col pt-1">
                <span
                  className="text-sm"
                  style={{ color: "#555", borderBottom: "1px solid #999", paddingBottom: 1 }}
                >
                  2025–1
                </span>
                <span
                  className="text-5xl font-bold mt-1"
                  style={{ color: "#3b4b80", textShadow: "1px 1px 3px rgba(0,0,0,0.15)" }}
                >
                  1
                </span>
              </div>
            </div>

            {/* Right: numbers + logo */}
            <div className="flex flex-col items-end">
              <div
                className="text-right mb-2 leading-snug"
                style={{
                  fontSize: "11px",
                  color: "#555",
                  letterSpacing: "1px",
                  fontFamily: "monospace",
                }}
              >
                {certNo}
                <br />
                {regNo}
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  backgroundColor: "#c02026",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "22px",
                  padding: "6px 10px",
                  borderRadius: "2px",
                  letterSpacing: "3px",
                  fontFamily: '"Yu Mincho", "MS Mincho", "Noto Serif JP", serif',
                }}
              >
                英険
              </div>
            </div>
          </div>

          {/* Ornamental divider */}
          <div
            className="text-center mb-2"
            style={{
              color: "#5a6b9c",
              fontSize: "22px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0,
                width: "100%",
              }}
            >
              <span
                style={{
                  flex: 1,
                  height: "2px",
                  background: "linear-gradient(to right, transparent, #5a6b9c)",
                }}
              />
              <span style={{ padding: "0 12px" }}>❀</span>
              <span
                style={{
                  flex: 1,
                  height: "2px",
                  background: "linear-gradient(to left, transparent, #5a6b9c)",
                }}
              />
            </span>
          </div>

          {/* Certificate title */}
          <h1
            className="text-center"
            style={{
              fontFamily: fontLoaded
                ? '"UnifrakturMaguntia", cursive'
                : '"Times New Roman", serif',
              fontSize: "62px",
              color: "#1a235a",
              margin: "8px 0 28px 0",
              fontWeight: "normal",
              lineHeight: 1.1,
            }}
          >
            Certificate
          </h1>

          {/* Grade subtitle */}
          <div className="mb-4" style={{ fontSize: "20px", color: "#333" }}>
            <span style={{ fontWeight: "bold", fontStyle: "italic" }}>Eiken</span>
            {"  "}
            <span
              style={{
                fontSize: "24px",
                fontStyle: "italic",
                marginLeft: "12px",
                color: "#1a235a",
              }}
            >
              Grade 1
            </span>
          </div>

          {/* Certification text */}
          <div
            className="mb-8"
            style={{
              fontSize: "16px",
              lineHeight: 1.8,
              fontStyle: "italic",
              color: "#333",
            }}
          >
            This is to certify that{" "}
            {name ? (
              <span
                style={{
                  fontStyle: "normal",
                  fontWeight: "bold",
                  fontSize: "20px",
                  display: "inline-block",
                  padding: "0 12px",
                  borderBottom: "1px solid #333",
                  minWidth: "160px",
                  textAlign: "center",
                }}
              >
                {name}
              </span>
            ) : (
              <span
                style={{
                  display: "inline-block",
                  width: "180px",
                  borderBottom: "1px solid #333",
                }}
              />
            )}
            <br />
            has successfully passed the above level of the Eiken
            <br />
            Test in Summary Writing Proficiency, conducted by
            <br />
            the Eiken Summary Simulator Commission.
          </div>

          {/* Score table */}
          <table
            className="w-full mb-8"
            style={{
              borderCollapse: "collapse",
              fontSize: "12px",
              fontStyle: "normal",
              backgroundColor: "#fff",
            }}
          >
            <thead>
              <tr>
                <th
                  rowSpan={2}
                  style={{
                    backgroundColor: "#8894b6",
                    color: "white",
                    border: "1px solid #8894b6",
                    padding: "8px",
                    fontWeight: "bold",
                    width: "15%",
                    fontSize: "11px",
                    lineHeight: 1.4,
                  }}
                >
                  Eiken
                  <br />
                  SCORE
                </th>
                {["Content", "Organization", "Vocabulary", "Grammar"].map((h) => (
                  <th
                    key={h}
                    style={{
                      backgroundColor: "#e0e4f0",
                      color: "#333",
                      border: "1px solid #8894b6",
                      padding: "8px",
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize: "11px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {[content, organization, vocabulary, grammar].map((s, i) => (
                  <td
                    key={i}
                    style={{
                      border: "1px solid #8894b6",
                      padding: "10px 8px",
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    {s}
                    <span style={{ fontSize: "11px", color: "#888", fontWeight: "normal" }}>
                      {" "}
                      / 8
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#8894b6",
                    color: "white",
                    border: "1px solid #8894b6",
                    padding: "8px",
                    fontWeight: "bold",
                    fontSize: "11px",
                  }}
                >
                  TOTAL
                </td>
                <td
                  colSpan={4}
                  style={{
                    border: "1px solid #8894b6",
                    padding: "10px 8px",
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#1a235a",
                  }}
                >
                  {total}
                  <span style={{ fontSize: "12px", color: "#888", fontWeight: "normal" }}>
                    {" "}
                    / 32
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="text-center">
            <div
              style={{
                fontSize: "14px",
                letterSpacing: "2px",
                marginBottom: "8px",
                fontStyle: "italic",
                color: "#555",
              }}
            >
              {date}
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Eiken Summary Simulator Commission
            </div>
            <p
              className="mt-5"
              style={{
                fontSize: "8px",
                color: "#bbb",
                fontFamily: "sans-serif",
                fontStyle: "normal",
              }}
            >
              ※ この証明書に法的効力はありません。これはジョークアプリです。
            </p>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="text-center mt-4">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm rounded hover:opacity-90 transition-opacity"
          style={{ background: "#2B3A67" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          合格証明書をダウンロード
        </button>
      </div>
    </div>
  );
});

export default Certificate;
