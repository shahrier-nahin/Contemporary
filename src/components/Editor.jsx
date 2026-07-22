import { generateCard } from "../services/api";
import { useState } from "react";
import History from "./History";

export default function Editor({ state, setState, onLogout }) {
  const [loadingRumor, setLoadingRumor] = useState(false);
  const [loadingFact, setLoadingFact] = useState(false);

  const update = (key, value) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ===========================
  // Generate — Rumor Article
  // ===========================
  async function handleGenerateRumor() {
    try {
      if (!state.rumorArticleUrl) {
        alert("Please enter the rumor article URL");
        return;
      }

      setLoadingRumor(true);

      const data = await generateCard(state.rumorArticleUrl, "rumor");

      setState((prev) => ({
        ...prev,
        rumorTitle: data.headline || prev.rumorTitle,
        rumorSummary: data.summary || prev.rumorSummary,
        rumorImage: data.image_url || prev.rumorImage,
        rumorArticleImage: data.image_url || prev.rumorArticleImage,
        source: data.source || prev.source,
        date: data.date || prev.date,
        remaining: data.remaining ?? prev.remaining,
      }));
    } catch (err) {
      console.error(err);
      alert("Rumor panel generation failed");
    } finally {
      setLoadingRumor(false);
    }
  }

  // ===========================
  // Generate — Fact Article
  // ===========================
  async function handleGenerateFact() {
    try {
      if (!state.factArticleUrl) {
        alert("Please enter the fact-check article URL");
        return;
      }

      setLoadingFact(true);

      const data = await generateCard(state.factArticleUrl, "fact");

      setState((prev) => ({
        ...prev,
        factTitle: data.headline || prev.factTitle,
        factSummary: data.summary || prev.factSummary,
        factImage: data.image_url || prev.factImage,
        factArticleImage: data.image_url || prev.factArticleImage,
        source: data.source || prev.source,
        date: data.date || prev.date,
        remaining: data.remaining ?? prev.remaining,
      }));
    } catch (err) {
      console.error(err);
      alert("Fact panel generation failed");
    } finally {
      setLoadingFact(false);
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
        Remaining Today: {state.remaining} / {state.dailyLimit || 14}
      </div>

      <div className="group">
        <label>Headline</label>
        <textarea
          value={state.headline || ""}
          onChange={(e) => update("headline", e.target.value)}
        />
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
        <label>Rumor Article URL</label>
        <input
          value={state.rumorArticleUrl || ""}
          onChange={(e) => update("rumorArticleUrl", e.target.value)}
          placeholder="Paste the rumor/claim article link"
        />
      </div>

      <button
        className="generate-btn"
        onClick={handleGenerateRumor}
        disabled={loadingRumor}
      >
        {loadingRumor ? "Generating..." : "✨ Generate From Rumor Article"}
      </button>

      <div className="group">
        <label>Rumor Panel Stamp</label>
        <select
          className="editor-select"
          value={state.rumorVerdictType || "Rumor"}
          onChange={(e) => update("rumorVerdictType", e.target.value)}
        >
          <option value="Rumor">Rumor</option>
          <option value="False">False</option>
          <option value="Misleading">Misleading</option>
          <option value="AI Generated">AI Generated</option>
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

      <div className="group">
        <label>Rumor Caption (bottom row)</label>
        <input
          value={state.rumorLabel || ""}
          onChange={(e) => update("rumorLabel", e.target.value)}
          placeholder="e.g. Global Market Collapse Rumors Spread"
        />
      </div>

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

      {/* ========================= */}
      {/* FACT PANEL */}
      {/* ========================= */}
      <div
        style={{
          margin: "8px 24px 4px",
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
        <label>Fact-Check Article URL</label>
        <input
          value={state.factArticleUrl || ""}
          onChange={(e) => update("factArticleUrl", e.target.value)}
          placeholder="Paste the verified/fact-check article link"
        />
      </div>

      <button
        className="generate-btn"
        onClick={handleGenerateFact}
        disabled={loadingFact}
      >
        {loadingFact ? "Generating..." : "✨ Generate From Fact Article"}
      </button>

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

      <div className="group">
        <label>Fact Caption (bottom row)</label>
        <input
          value={state.factLabel || ""}
          onChange={(e) => update("factLabel", e.target.value)}
          placeholder="e.g. Markets Experience Modest Growth"
        />
      </div>

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

      {/* ========================= */}
      {/* CARD META */}
      {/* ========================= */}
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
  onSelectCard={(card) => {
    setState((prev) => ({
      ...prev,
      headline: card.headline || prev.headline,

      // Rumor panel
      rumorTitle: card.rumor_title || "",
      rumorSummary: card.rumor_summary || "",
      rumorArticleUrl: card.rumor_article_url || "",
      rumorImage: card.rumor_image_url || "",
      rumorArticleImage: card.rumor_image_url || "",
      rumorVerdictType: card.rumor_verdict_type || "Rumor",
      rumorLabel: card.rumor_label || "",

      // Fact panel
      factTitle: card.fact_title || "",
      factSummary: card.fact_summary || "",
      factArticleUrl: card.fact_article_url || "",
      factImage: card.fact_image_url || "",
      factArticleImage: card.fact_image_url || "",
      factLabel: card.fact_label || "",

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