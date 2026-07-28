import { generateFactCheck, saveCardHistory } from "../services/api";
import { useState } from "react";
import History from "./History";

export default function Editor({ state, setState, onLogout }) {
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const update = (key, value) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ===========================
  // Auto-save to History
  // ===========================
  async function autoSaveHistory(updatedFields) {
    try {
      const merged = { ...state, ...updatedFields };

      const result = await saveCardHistory({
        id: merged.historyId || undefined,
        headline: merged.headline,
        rumorTitle: merged.rumorTitle,
        rumorSummary: merged.rumorSummary,
        rumorArticleUrl: merged.rumorArticleUrl,
        rumorImage: merged.rumorImage,
        rumorVerdictType: merged.rumorVerdictType,
        rumorLabel: merged.rumorLabel,
        factTitle: merged.factTitle,
        factSummary: merged.factSummary,
        factArticleUrl: merged.factArticleUrl,
        factVerdictType: merged.factVerdictType,
        factImage: merged.factImage,
        factLabel: merged.factLabel,
        source: merged.source,
      });

      setState((prev) => ({ ...prev, historyId: result.id }));
      setHistoryRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Auto-save to history failed:", err);
    }
  }

  // ===========================
  // Generate — BOTH panels in one call
  // ===========================
async function handleGenerate() {
  try {
    const rumorHasInput =
      (state.rumorInputMode === "text" && state.rumorArticleText) ||
      (state.rumorInputMode !== "text" && state.rumorArticleUrl);

    const factHasInput =
      (state.factInputMode === "text" && state.factArticleText) ||
      (state.factInputMode !== "text" && state.factArticleUrl);

    if (!rumorHasInput || !factHasInput) {
      alert("Please provide a URL or pasted text for both the rumor and fact sides");
      return;
    }

    setLoadingGenerate(true);

    const data = await generateFactCheck({
      rumorArticleUrl: state.rumorInputMode === "text" ? "" : state.rumorArticleUrl,
      rumorArticleText: state.rumorInputMode === "text" ? state.rumorArticleText : "",
      factArticleUrl: state.factInputMode === "text" ? "" : state.factArticleUrl,
      factArticleText: state.factInputMode === "text" ? state.factArticleText : "",
    });

const rumorIsTextMode = state.rumorInputMode === "text";
const factIsTextMode = state.factInputMode === "text";

const updatedFields = {
  headline: data.headline || state.headline,
  rumorTitle: data.rumorTitle || state.rumorTitle,
  rumorSummary: data.rumorSummary || state.rumorSummary,
  rumorImage: rumorIsTextMode ? data.rumorImage || "" : data.rumorImage || state.rumorImage,
  rumorArticleImage: rumorIsTextMode ? data.rumorImage || "" : data.rumorImage || state.rumorArticleImage,
  factTitle: data.factTitle || state.factTitle,
  factSummary: data.factSummary || state.factSummary,
  factImage: factIsTextMode ? data.factImage || "" : data.factImage || state.factImage,
  factArticleImage: factIsTextMode ? data.factImage || "" : data.factImage || state.factArticleImage,
  facebookCaption: data.facebookCaption || state.facebookCaption,
  hashtags: Array.isArray(data.hashtags)
    ? data.hashtags.join(" ")
    : state.hashtags,
  source: data.source || state.source,
  date: data.date || state.date,
  remaining: data.remaining ?? state.remaining,
};

    setState((prev) => ({ ...prev, ...updatedFields }));

    await autoSaveHistory(updatedFields);
  } catch (err) {
    console.error(err);
    alert("Generation failed");
  } finally {
    setLoadingGenerate(false);
  }
}

  // ===========================
  // Manual Image Uploads
  // ===========================
  function handleRumorImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("rumorImage", reader.result);
    reader.readAsDataURL(file);
  }

  function handleFactImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("factImage", reader.result);
    reader.readAsDataURL(file);
  }

  function restoreRumorImage() {
    if (state.rumorArticleImage) update("rumorImage", state.rumorArticleImage);
  }

  function restoreFactImage() {
    if (state.factArticleImage) update("factImage", state.factArticleImage);
  }

  return (
    <div className="editor">
      <h2 className="panel-title">Contemporary Card Generator</h2>

      <div
        style={{
          margin: "20px 24px",
          padding: 12,
          background: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: 10,
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Remaining Today: {state.remaining} / {state.dailyLimit || 100}
      </div>

      <div className="group">
        <label>Headline</label>
        <textarea
          value={state.headline || ""}
          onChange={(e) => update("headline", e.target.value)}
        />
      </div>

      {/* ========================= */}
      {/* ARTICLE URLS + SINGLE GENERATE BUTTON */}
      {/* ========================= */}
<div
  style={{
    margin: "24px 24px 4px",
    paddingTop: 16,
    borderTop: "2px solid #eee",
    fontWeight: 800,
    fontSize: 15,
    color: "#333",
    letterSpacing: 0.5,
  }}
>
  SOURCE ARTICLES
</div>

{/* Rumor source input */}
<div className="group">
  <label>Rumor / Claim Source</label>
  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
    <button
      type="button"
      className="generate-btn"
      onClick={() => update("rumorInputMode", "link")}
      style={{
        flex: 1,
        background: state.rumorInputMode !== "text" ? "#e63946" : "#ccc",
      }}
    >
      Link
    </button>
    <button
      type="button"
      className="generate-btn"
      onClick={() => update("rumorInputMode", "text")}
      style={{
        flex: 1,
        background: state.rumorInputMode === "text" ? "#e63946" : "#ccc",
      }}
    >
      Paste Text
    </button>
  </div>

  {state.rumorInputMode === "text" ? (
    <textarea
      value={state.rumorArticleText || ""}
      onChange={(e) => update("rumorArticleText", e.target.value)}
      rows="6"
      placeholder="Paste the full rumor/claim article text here"
    />
  ) : (
    <input
      value={state.rumorArticleUrl || ""}
      onChange={(e) => update("rumorArticleUrl", e.target.value)}
      placeholder="Paste the rumor/claim article link"
    />
  )}
</div>

{/* Fact source input */}
<div className="group">
  <label>Fact-Check Source</label>
  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
    <button
      type="button"
      className="generate-btn"
      onClick={() => update("factInputMode", "link")}
      style={{
        flex: 1,
        background: state.factInputMode !== "text" ? "#2a9d3f" : "#ccc",
      }}
    >
      Link
    </button>
    <button
      type="button"
      className="generate-btn"
      onClick={() => update("factInputMode", "text")}
      style={{
        flex: 1,
        background: state.factInputMode === "text" ? "#2a9d3f" : "#ccc",
      }}
    >
      Paste Text
    </button>
  </div>

  {state.factInputMode === "text" ? (
    <textarea
      value={state.factArticleText || ""}
      onChange={(e) => update("factArticleText", e.target.value)}
      rows="6"
      placeholder="Paste the full fact-check/verified article text here"
    />
  ) : (
    <input
      value={state.factArticleUrl || ""}
      onChange={(e) => update("factArticleUrl", e.target.value)}
      placeholder="Paste the verified/fact-check article link"
    />
  )}
</div>

<button
  className="generate-btn"
  onClick={handleGenerate}
  disabled={loadingGenerate}
>
  {loadingGenerate ? "Generating..." : "✨ Generate Fact Check"}
</button>


      {/* ========================= */}
      {/* TEXT ALIGNMENT */}
      {/* ========================= */}

      <div
        style={{
          margin: "24px 24px 4px",
          paddingTop: 16,
          borderTop: "2px solid #eee",
          fontWeight: 800,
          fontSize: 15,
          color: "#333",
          letterSpacing: 0.5,
        }}
      >
        TEXT ALIGNMENT
      </div>

      <div className="group">
        <label>Headline Alignment</label>
        <select
          className="editor-select"
          value={state.headlineAlign || "center"}
          onChange={(e) => update("headlineAlign", e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      <div className="group">
        <label>Rumor Panel Text Alignment</label>
        <select
          className="editor-select"
          value={state.rumorAlign || "left"}
          onChange={(e) => update("rumorAlign", e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      <div className="group">
        <label>Fact Panel Text Alignment</label>
        <select
          className="editor-select"
          value={state.factAlign || "left"}
          onChange={(e) => update("factAlign", e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>


    <div className="group">
      <label>Rumor Panel Text Position</label>
      <select
        className="editor-select"
        value={state.rumorTextPosition || "bottom"}
        onChange={(e) => update("rumorTextPosition", e.target.value)}
      >
        <option value="top">Top</option>
        <option value="bottom">Bottom</option>
      </select>
    </div>

    <div className="group">
      <label>Fact Panel Text Position</label>
      <select
        className="editor-select"
        value={state.factTextPosition || "bottom"}
        onChange={(e) => update("factTextPosition", e.target.value)}
      >
        <option value="top">Top</option>
        <option value="bottom">Bottom</option>
      </select>
    </div>

      
      {/* ========================= */}
      {/* RUMOR PANEL */}
      {/* ========================= */}
      <div
        style={{
          margin: "24px 24px 4px",
          paddingTop: 16,
          borderTop: "2px solid #eee",
          fontWeight: 800,
          fontSize: 15,
          color: "#e63946",
          letterSpacing: 0.5,
        }}
      >
        RUMOR PANEL
      </div>

      <div className="group">
        <label>Rumor Panel Stamp</label>
        <select
          className="editor-select"
          value={state.rumorVerdictType || "Unverified"}
          onChange={(e) => update("rumorVerdictType", e.target.value)}
        >
          <option value="Unverified">Unverified</option>
          <option value="Misinformation">Misinformation</option>
          <option value="Disinformation">Disinformation</option>
          <option value="AI Generated">AI Generated</option>
          <option value="Fake">Fake</option>
        </select>
      </div>

      <div className="group">
        <label>Rumor Title</label>
        <input
          value={state.rumorTitle || ""}
          onChange={(e) => update("rumorTitle", e.target.value)}
          placeholder="e.g. Global Market Rumors"
        />
      </div>

      <div className="group">
        <label>Rumor Summary</label>
        <textarea
          value={state.rumorSummary || ""}
          onChange={(e) => update("rumorSummary", e.target.value)}
          rows="5"
        />
      </div>
{/*
      <div className="group">
        <label>Rumor Caption (bottom row)</label>
        <input
          value={state.rumorLabel || ""}
          onChange={(e) => update("rumorLabel", e.target.value)}
          placeholder="e.g. Global Market Collapse Rumors Spread"
        />
      </div> 
*/}
      <div className="group">
        <label>Upload Rumor Panel Image</label>
        <input type="file" accept="image/*" onChange={handleRumorImageUpload} />
      </div>

      <button
        className="generate-btn"
        type="button"
        onClick={restoreRumorImage}
        style={{ marginTop: -10, marginBottom: 20, background: "#444" }}
      >
        Restore Rumor Article Image
      </button>

      {/* Rumor panel image controls */}
      <ImageControls
        label="Rumor"
        opacity={state.rumorImageOpacity ?? 60}
        brightness={state.rumorImageBrightness ?? 100}
        blur={state.rumorImageBlur ?? 0}
        onOpacityChange={(v) => update("rumorImageOpacity", v)}
        onBrightnessChange={(v) => update("rumorImageBrightness", v)}
        onBlurChange={(v) => update("rumorImageBlur", v)}
      />

      {/* ========================= */}
      {/* FACT PANEL */}
      {/* ========================= */}
      <div
        style={{
          margin: "24px 24px 4px",
          paddingTop: 16,
          borderTop: "2px solid #eee",
          fontWeight: 800,
          fontSize: 15,
          color: "#2a9d3f",
          letterSpacing: 0.5,
        }}
      >
        FACT PANEL
      </div>

      <div className="group">
        <label>Fact Panel Stamp</label>
        <select
          className="editor-select"
          value={state.factVerdictType || "Fact"}
          onChange={(e) => update("factVerdictType", e.target.value)}
        >
          <option value="Verified">Verified</option>
          <option value="Fact">Fact</option>
        </select>
      </div>

      <div className="group">
        <label>Fact Title</label>
        <input
          value={state.factTitle || ""}
          onChange={(e) => update("factTitle", e.target.value)}
          placeholder="e.g. Markets Show Resilience"
        />
      </div>

      <div className="group">
        <label>Fact Summary</label>
        <textarea
          value={state.factSummary || ""}
          onChange={(e) => update("factSummary", e.target.value)}
          rows="5"
        />
      </div>
{/*
      <div className="group">
        <label>Fact Caption (bottom row)</label>
        <input
          value={state.factLabel || ""}
          onChange={(e) => update("factLabel", e.target.value)}
          placeholder="e.g. Markets Experience Modest Growth"
        />
      </div>
*/}
      <div className="group">
        <label>Upload Fact Panel Image</label>
        <input type="file" accept="image/*" onChange={handleFactImageUpload} />
      </div>

      <button
        className="generate-btn"
        type="button"
        onClick={restoreFactImage}
        style={{ marginTop: -10, marginBottom: 20, background: "#444" }}
      >
        Restore Fact Article Image
      </button>

      {/* Fact panel image controls */}
      <ImageControls
        label="Fact"
        opacity={state.factImageOpacity ?? 60}
        brightness={state.factImageBrightness ?? 100}
        blur={state.factImageBlur ?? 0}
        onOpacityChange={(v) => update("factImageOpacity", v)}
        onBrightnessChange={(v) => update("factImageBrightness", v)}
        onBlurChange={(v) => update("factImageBlur", v)}
      />

      {/* ========================= */}
      {/* CARD META */}
      {/* ========================= */}
      
    <div
      style={{
        margin: "24px 24px 4px",
        paddingTop: 16,
        borderTop: "2px solid #eee",
        fontWeight: 800,
        fontSize: 15,
        color: "#1877F2", // Meta's Official Blue
        letterSpacing: 0.5,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="#1877F2"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      FACEBOOK POST
    </div>
        
      <div className="group">
        <label>Caption</label>
        <textarea
          value={state.facebookCaption || ""}
          onChange={(e) => update("facebookCaption", e.target.value)}
          rows="6"
          placeholder="Auto-generated caption for Facebook post"
        />
      </div>
      <div
        style={{
          margin: "8px 24px 4px",
          paddingTop: 16,
          borderTop: "2px solid #eee",
          fontWeight: 800,
          fontSize: 15,
          color: "#333",
          letterSpacing: 0.5,
        }}
      >




        CARD INFO
      </div>

      <div className="group">
        <label>Source</label>
        <input
          value={state.source || ""}
          onChange={(e) => update("source", e.target.value)}
        />
      </div>

      <div className="group">
        <label>Date</label>
        <input
          value={state.date || ""}
          onChange={(e) => update("date", e.target.value)}
        />
      </div>

      <div className="group">
        <label>Hashtags (used when posting to Facebook)</label>
        <input
          value={state.hashtags || ""}
          onChange={(e) => update("hashtags", e.target.value)}
        />
      </div>

      <History
        refreshKey={historyRefreshKey}
        onSelectCard={(card) => {
          setState((prev) => ({
            ...prev,
            historyId: card.id,
            headline: card.headline || prev.headline,

            rumorTitle: card.rumor_title || "",
            rumorSummary: card.rumor_summary || "",
            rumorArticleUrl: card.rumor_article_url || "",
            rumorImage: card.rumor_image_url || "",
            rumorArticleImage: card.rumor_image_url || "",
            rumorVerdictType: card.rumor_verdict_type || "Rumor",
            rumorLabel: card.rumor_label || "",

            factTitle: card.fact_title || "",
            factSummary: card.fact_summary || "",
            factArticleUrl: card.fact_article_url || "",
            factImage: card.fact_image_url || "",
            factArticleImage: card.fact_image_url || "",
            factLabel: card.fact_label || "",
            factVerdictType: card.fact_verdict_type || "Fact",

            source: card.source || prev.source,
          }));
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 30,
          marginBottom: 20,
        }}
      >
        <button
          onClick={onLogout}
          style={{
            background: "#e63946",
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
            width: "180px",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Reusable Opacity/Brightness/Blur sliders for a panel image
   ============================================================ */
function ImageControls({
  label,
  opacity,
  brightness,
  blur,
  onOpacityChange,
  onBrightnessChange,
  onBlurChange,
}) {
  return (
    <div style={{ margin: "0 24px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 8 }}>
        {label} Image Controls
      </div>

      <label style={{ fontSize: 12, color: "#666" }}>
        Background Opacity ({opacity}%)
      </label>
      <input
        type="range"
        min="0"
        max="100"
        value={opacity}
        onChange={(e) => onOpacityChange(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label style={{ fontSize: 12, color: "#666" }}>
        Background Brightness ({brightness}%)
      </label>
      <input
        type="range"
        min="0"
        max="200"
        value={brightness}
        onChange={(e) => onBrightnessChange(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label style={{ fontSize: 12, color: "#666" }}>
        Background Blur ({blur}px)
      </label>
      <input
        type="range"
        min="0"
        max="20"
        value={blur}
        onChange={(e) => onBlurChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}