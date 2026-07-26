import { useState } from "react";
import { TEMPLATE_CONFIG } from "../config/templates";

const RUMOR_VERDICT_TYPES = {
  Unverified: { color: "#f77f00", label: "Unverified" },
  Misinformation: { color: "#e63946", label: "Misinformation" },
  Disinformation: { color: "#b0202e", label: "Disinformation" },
  "AI Generated": { color: "#6a4c93", label: "AI Generated" },
};

const FACT_VERDICT_TYPES = {
  Verified: { color: "#2a9d3f", label: "Verified" },
  Fact: { color: "#1d7a30", label: "Fact" },
};

function alignToFlex(align) {
  if (align === "left") return "flex-start";
  if (align === "right") return "flex-end";
  return "center";
}

export default function Contemporary({ state, setState }) {
  const config = TEMPLATE_CONFIG.contemporary;
  const rumorVerdict = RUMOR_VERDICT_TYPES[state.rumorVerdictType] || RUMOR_VERDICT_TYPES.Unverified;

  const rumorStamp = config.stamps[state.rumorVerdictType] || config.stamps.Unverified;
  const factStamp = config.stamps[state.factVerdictType] || config.stamps.Fact;

  const rumorBadgePos = state.rumorBadgePos || { x: 78, y: 14 };
  const factBadgePos = state.factBadgePos || { x: 78, y: 14 };

  const headlineAlign = state.headlineAlign || "center";
  const rumorAlign = state.rumorAlign || "left";
  const factAlign = state.factAlign || "left";

  function updateRumorBadgePos(pos) {
    setState && setState((prev) => ({ ...prev, rumorBadgePos: pos }));
  }

  function updateFactBadgePos(pos) {
    setState && setState((prev) => ({ ...prev, factBadgePos: pos }));
  }

  return (
    <div
      id="card"
      style={{
        width: "1080px",
        height: "1350px",
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(circle at 15% 0%, #ffffff 0%, #f2f2f0 55%, #ebebe8 100%)",
        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif",
        color: "#111",
        display: "flex",
        flexDirection: "column",
        padding: "48px 64px 56px",
        boxSizing: "border-box",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {/* TOP ACCENT STRIPE */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          background: "linear-gradient(90deg, #e63946 0%, #f77f00 50%, #2a9d3f 100%)",
        }}
      />

      {/* HEADER: DATE (Left) & LOGO (Right) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 24,
          borderBottom: "2px solid rgba(13,27,42,0.08)",
        }}
      >
        <span
          style={{
            padding: "8px 18px",
            fontWeight: 600,
            fontSize: 20,
            opacity: 0.8,
          }}
        >
          {state.date}
        </span>
        <img
          src={config.factCheckLogo}
          alt="fact-check logo"
          crossOrigin="anonymous"
          style={{
            height: 72,
            transform: "scale(1.25)",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* TITLE */}
      <div
        style={{
          textAlign: headlineAlign,
          margin: "34px 0 38px",
        }}
      >
        <h1
          style={{
            fontSize: 44,
            fontWeight: 800,
            margin: 0,
            color: "#0d1b2a",
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
            textAlign: headlineAlign,
          }}
        >
          {state.headline}
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 120,
              height: 6,
              borderRadius: 6,
              marginTop: 18,
              background: "linear-gradient(90deg, #e63946, #f77f00)",
            }}
          />
        </div>
      </div>

      {/* TWO PANELS: RUMOR / FACT */}
      <div style={{
        display: "flex",
        gap: 0,
        flex: 1,
        position: "relative",
      }}>

        <FactPanel
          accent="#e63946"
          eyebrowIcon="⚠"
          eyebrow="দাবীকৃত তথ্য"
          title={state.rumorTitle}
          summary={state.rumorSummary}
          textAlign={rumorAlign}
          textPosition={state.rumorTextPosition || "bottom"}
          watermarkImage={state.rumorImage}
          imageOpacity={state.rumorImageOpacity ?? 60}
          imageBrightness={state.rumorImageBrightness ?? 100}
          imageBlur={state.rumorImageBlur ?? 0}
          stampSrc={rumorStamp}
          stampPos={rumorBadgePos}
          onStampMove={updateRumorBadgePos}
          isLeft={true}
        />

        <div style={{ width: 28, flexShrink: 0 }} />

        <FactPanel
          accent="#2a9d3f"
          eyebrowIcon="✓"
          eyebrow="সত্যতা যাচাই"
          title={state.factTitle}
          summary={state.factSummary}
          textAlign={factAlign}
          textPosition={state.factTextPosition || "bottom"}
          watermarkImage={state.factImage}
          imageOpacity={state.factImageOpacity ?? 60}
          imageBrightness={state.factImageBrightness ?? 100}
          imageBlur={state.factImageBlur ?? 0}
          stampSrc={factStamp}
          stampPos={factBadgePos}
          onStampMove={updateFactBadgePos}
          isLeft={false}
        />
      </div>

      {/* FOOTER: SOURCE ONLY (Right aligned) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: 34,
          paddingTop: 22,
          paddingBottom: 8,
          borderTop: "2px solid rgba(13,27,42,0.08)",
        }}
      >
        <span
          style={{
            background: "rgba(13,27,42,0.06)",
            padding: "8px 18px",
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 20,
            opacity: 0.8,
          }}
        >
          SOURCE: {state.source}
        </span>
      </div>

      {/* COPYRIGHT */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 22,
          textAlign: "center",
          fontSize: 16,
          fontWeight: 600,
          opacity: 0.5,
        }}
      >
        {config.copyright}
      </div>
    </div>
  );
}

/* ============================================================
   FACT / RUMOR PANEL (IMPROVED LEGIBILITY & DESIGN)
   ============================================================ */
function FactPanel({
  accent,
  eyebrowIcon,
  eyebrow,
  title,
  summary,
  textAlign,
  textPosition,
  watermarkImage,
  imageOpacity,
  imageBrightness,
  imageBlur,
  stampSrc,
  stampPos,
  onStampMove,
  isLeft,
}) {
  return (
    <div
      data-panel="true"
      style={{
        position: "relative",
        flex: 1,
        borderRadius: "22px",
        overflow: "hidden",
        backgroundColor: "#0d1b2a",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        border: `2px solid ${accent}`,
      }}
    >
      {/* WATERMARK ARTICLE IMAGE */}
      {watermarkImage && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage: `url(${watermarkImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: (imageOpacity ?? 70) / 100,
            filter: `brightness(${(imageBrightness ?? 90) / 100}) blur(${imageBlur ?? 0}px)`,
            zIndex: 0,
          }}
        />
      )}

      {/* DARK GRADIENT OVERLAY (Guarantees contrast for all images) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background:
            "linear-gradient(180deg, rgba(13,27,42,0.15) 0%, rgba(13,27,42,0.55) 60%, rgba(13,27,42,0.7) 100%)",
          zIndex: 1,
        }}
      />

      {/* DRAGGABLE STAMP IMAGE */}
      {stampSrc && (
        <DraggableStamp src={stampSrc} position={stampPos} onPositionChange={onStampMove} />
      )}

      {/* TOP HEADER / EYEBROW CHIP */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "24px 24px 0",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: accent,
            color: "#fff",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 1,
            padding: "8px 16px",
            borderRadius: 999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
            fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
          }}
        >
          <span style={{
            fontSize: 22,
            lineHeight: 1,
            fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
          }}>
            {eyebrowIcon}
          </span>
          <span style={{ marginLeft: 8 }}>{eyebrow}</span>
        </div>
      </div>

      {/* TEXT CONTENT CARD */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          margin: "16px",
          marginTop: textPosition === "top" ? 16 : "auto",
          marginBottom: textPosition === "top" ? "auto" : 16,
          padding: "22px 24px",
          borderRadius: "16px",
          background: "rgba(10, 20, 32, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.3,
            margin: 0,
            textAlign,
            letterSpacing: "-0.2px",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: 23,
            lineHeight: 1.55,
            color: "#e2e8f0",
            margin: 0,
            marginTop: 12,
            textAlign,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 7,
            overflow: "hidden",
            fontWeight: 400,
          }}
        >
          {summary}
        </p>
      </div>

      {/* LEFT ACCENT BAR */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 6,
          background: accent,
          zIndex: 3,
        }}
      />
    </div>
  );
}

/* ============================================================
   DRAGGABLE STAMP
   ============================================================ */
function DraggableStamp({ src, position, onPositionChange, size = 220 }) {
  const [pos, setPos] = useState(position || { x: 78, y: 14 });
  const [dragging, setDragging] = useState(false);

  function handlePointerDown(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    const panel = e.currentTarget.closest('[data-panel="true"]');
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.min(100, Math.max(0, x));
    y = Math.min(100, Math.max(0, y));
    const next = { x, y };
    setPos(next);
    onPositionChange && onPositionChange(next);
  }

  function handlePointerUp(e) {
    e.target.releasePointerCapture(e.pointerId);
    setDragging(false);
  }

  return (
    <img
      src={src}
      alt="verdict stamp"
      crossOrigin="anonymous"
      draggable={false}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "absolute",
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)",
        width: size,
        height: size,
        objectFit: "contain",
        zIndex: 3,
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
      }}
    />
  );
}