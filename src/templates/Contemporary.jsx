import { useState } from "react";
import { TEMPLATE_CONFIG } from "../config/templates";

const VERDICT_TYPES = {
  Rumor: { color: "#f77f00", label: "Rumor" },
  False: { color: "#e63946", label: "False" },
  Misleading: { color: "#d4a017", label: "Misleading" },
  "AI Generated": { color: "#6a4c93", label: "AI Generated" },
};

export default function Contemporary({ state, setState }) {
  const config = TEMPLATE_CONFIG.contemporary;
  const rumorVerdict = VERDICT_TYPES[state.rumorVerdictType] || VERDICT_TYPES.Rumor;

  const rumorStamp = config.stamps[state.rumorVerdictType] || config.stamps.Rumor;
  const factStamp = config.stamps.Fact;

  const rumorBadgePos = state.rumorBadgePos || { x: 78, y: 14 };
  const factBadgePos = state.factBadgePos || { x: 78, y: 14 };

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
        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        color: "#111",
        display: "flex",
        flexDirection: "column",
        padding: "48px 64px 56px",
        boxSizing: "border-box",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
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

{/* HEADER: LOGO */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 24,
    borderBottom: "2px solid rgba(13,27,42,0.08)",
  }}
>
  <img
    src={config.factCheckLogo}
    alt="fact-check logo"
    crossOrigin="anonymous"
    style={{ height: 72, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
  />
</div>

      {/* TITLE */}
      <div style={{ textAlign: "center", margin: "34px 0 38px" }}>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 800,
            margin: 0,
            color: "#0d1b2a",
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
          }}
        >
          {state.headline}
        </h1>
        <div
          style={{
            width: 120,
            height: 6,
            borderRadius: 6,
            margin: "18px auto 0",
            background: "linear-gradient(90deg, #e63946, #f77f00)",
          }}
        />
      </div>

      {/* TWO PANELS: RUMOR / FACT */}
      <div style={{ display: "flex", gap: 28, flex: 1 }}>
        <FactPanel
          gradient="linear-gradient(160deg, rgba(230,57,70,0.16) 0%, rgba(230,57,70,0.06) 100%)"
          accent="#e63946"
          eyebrowIcon="⚠"
          eyebrow="দাবীকৃত তথ্য"
          title={state.rumorTitle}
          summary={state.rumorSummary}
          watermarkImage={state.rumorImage}
          imageOpacity={state.rumorImageOpacity ?? 60}
          imageBrightness={state.rumorImageBrightness ?? 100}
          imageBlur={state.rumorImageBlur ?? 0}
          stampSrc={rumorStamp}
          stampPos={rumorBadgePos}
          onStampMove={updateRumorBadgePos}
        />

        <FactPanel
          gradient="linear-gradient(160deg, rgba(56,176,0,0.16) 0%, rgba(56,176,0,0.06) 100%)"
          accent="#2a9d3f"
          eyebrowIcon="✓"
          eyebrow="সত্যতা যাচাই"
          title={state.factTitle}
          summary={state.factSummary}
          watermarkImage={state.factImage}
          imageOpacity={state.factImageOpacity ?? 60}
          imageBrightness={state.factImageBrightness ?? 100}
          imageBlur={state.factImageBlur ?? 0}
          stampSrc={factStamp}
          stampPos={factBadgePos}
          onStampMove={updateFactBadgePos}
        />
      </div>

      {/* VERDICT ROW */}
      {/* 
      <div
        style={{
          display: "flex",
          gap: 28,
          marginTop: 36,
          padding: "26px 28px",
          borderRadius: 18,
          background: "linear-gradient(180deg, #ffffff 0%, #f7f7f5 100%)",
          boxShadow: "0 4px 18px rgba(13,27,42,0.08)",
        }}
      >
        <VerdictBlock
          verdictColor={rumorVerdict.color}
          verdictLabel={rumorVerdict.label}
          isFalse
          caption={`Rumor: ${state.rumorLabel || ""}`}
        />
        <div style={{ width: 2, alignSelf: "stretch", background: "rgba(13,27,42,0.08)" }} />
        <VerdictBlock
          verdictColor="#2a9d3f"
          verdictLabel="Fact Checked"
          isFalse={false}
          caption={`Fact: ${state.factLabel || ""}`}
        />
      </div> 
      */}

    {/* FOOTER: DATE + SOURCE */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 34,
        paddingTop: 22,
        paddingBottom: 8,
        borderTop: "2px solid rgba(13,27,42,0.08)",
        fontSize: 20,
      }}
    >
      <span
        style={{
          background: "rgba(13,27,42,0.06)",
          padding: "8px 18px",
          borderRadius: 999,
          fontWeight: 600,
          opacity: 0.8,
        }}
      >
        DATE: {state.date}
      </span>
      <span
        style={{
          background: "rgba(13,27,42,0.06)",
          padding: "8px 18px",
          borderRadius: 999,
          fontWeight: 600,
          opacity: 0.8,
        }}
      >
        SOURCE: {state.source}
      </span>
    </div>

    {/* COPYRIGHT — pinned to the very bottom of the card */}
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
   FACT / RUMOR PANEL
   ============================================================ */
function FactPanel({
  gradient,
  accent,
  eyebrowIcon,
  eyebrow,
  title,
  summary,
  watermarkImage,
  imageOpacity,
  imageBrightness,
  imageBlur,
  stampSrc,
  stampPos,
  onStampMove,
}) {
  return (
    <div
      data-panel="true"
      style={{
        position: "relative",
        flex: 1,
        borderRadius: 22,
        overflow: "hidden",
        background: gradient,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 6px 20px rgba(13,27,42,0.10)",
        border: `1px solid ${accent}33`,
      }}
    >
      {/* WATERMARK ARTICLE IMAGE (full-panel background, user-adjustable) */}
      {watermarkImage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${watermarkImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: (imageOpacity ?? 60) / 100,
            filter: `brightness(${(imageBrightness ?? 100) / 100}) blur(${imageBlur ?? 0}px)`,
            zIndex: 0,
          }}
        />
      )}

      {/* soft vignette so text stays readable over the watermark */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 40%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* DRAGGABLE STAMP IMAGE */}
      {stampSrc && (
        <DraggableStamp src={stampSrc} position={stampPos} onPositionChange={onStampMove} />
      )}

      {/* EYEBROW CHIP */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          background: accent,
          color: "#fff",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: 1,
          padding: "6px 14px",
          borderRadius: 999,
          marginTop: 44,
          boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
        }}
      >
        <span>{eyebrowIcon}</span>
        <span>{eyebrow}</span>
      </div>

{/* CONTENT */}
<div
  style={{
    position: "relative",
    zIndex: 1,
    marginTop: 16,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }}
>
  <h2
    style={{
      fontSize: 32,
      fontWeight: 700,
      marginBottom: 16,
      color: "#0d1b2a",
      lineHeight: 1.25,
    }}
  >
    {title}
  </h2>
  <p
    style={{
      fontSize: 25,
      lineHeight: 1.55,
      color: "#1a1a1a",
      display: "-webkit-box",
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: 9,
      overflow: "hidden",
    }}
  >
    {summary}
  </p>
</div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 7,
          background: accent,
        }}
      />
    </div>
  );
}

/* ============================================================
   DRAGGABLE STAMP
   ============================================================ */
function DraggableStamp({ src, position, onPositionChange, size = 240 }) {
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
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.25))",
      }}
    />
  );
}

/* ============================================================
   VERDICT BLOCK (kept for future use — currently unused
   since the verdict row above is commented out)
   ============================================================ */
function VerdictBlock({ verdictColor, verdictLabel, isFalse, caption }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 18 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `${verdictColor}1A`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isFalse ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 5L19 19M19 5L5 19" stroke={verdictColor} strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M4 12.5L9.5 18L20 6" stroke={verdictColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#0d1b2a", lineHeight: 1.2 }}>
          {verdictLabel}
        </div>
        <div style={{ fontSize: 20, marginTop: 4, opacity: 0.75 }}>{caption}</div>
      </div>
    </div>
  );
}