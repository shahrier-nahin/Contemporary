import { useEffect, useState } from "react";
import Contemporary from "../templates/Contemporary";
import { downloadCard, getCardBlob } from "../utils/downloadCard";
import { postToFacebook } from "../services/api";

export default function Preview({ state }) {
  const [scale, setScale] = useState(0.62);

  useEffect(() => {
    function updateScale() {
      const availableWidth = window.innerWidth - 400;

      const cardWidth = 1080; // your template width

      const newScale = Math.min(availableWidth / cardWidth, 0.62);

      setScale(Math.max(newScale, 0.25));
    }

    updateScale();

    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, []);

  async function handleFacebookPost() {
    try {
      const blob = await getCardBlob("export-card");

      const formData = new FormData();

      formData.append("image", blob, "card.png");

      formData.append("summary", state.summary || "");

      formData.append("hashtags", state.hashtags || "");

      const result = await postToFacebook(formData);

      if (result.success) {
        alert("Data sent successfully!");
      } else {
        alert("Failed to send data.");
      }
    } catch (err) {
      console.error(err);

      alert("Failed to send data.");
    }
  }
  return (
    <div
      className="preview-scroll-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxHeight: "100vh",
        overflowY: "auto",
        padding: "20px 10px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 1080 * scale,
          height: 1350 * scale,
          position: "relative",
          marginBottom: "20px",
          flexShrink: 0,
        }}
      >
        <div
          className="preview-frame"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: "1080px",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <Contemporary state={state} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-99999px",
          width: "1080px",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <div id="export-card">
          <Contemporary state={state} />
        </div>
      </div>

      <div
        className="action-buttons"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "14px",
          width: "100%",
          maxWidth: `${Math.min(1080 * scale, 500)}px`,
          paddingBottom: "16px",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <button
          className="download-btn"
          onClick={() => downloadCard("export-card")}
          style={primaryButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download PNG
        </button>

        <button
          className="facebook-btn"
          onClick={handleFacebookPost}
          style={secondaryButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 8.5h2.5V5.2c-.43-.06-1.93-.2-3.68-.2-3.64 0-6.14 2.29-6.14 6.49v3.01H4.5V18h3.18v10h3.87V18h3.06l.5-3.5h-3.56v-2.63c0-1.02.28-1.72 1.75-1.72z" fill="#ffffff" />
          </svg>
          Post to Facebook
        </button>
      </div>
    </div>
  );
}

const baseButtonStyle = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "0.2px",
  cursor: "pointer",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
  whiteSpace: "nowrap",
};

const primaryButtonStyle = {
  ...baseButtonStyle,
  background: "linear-gradient(135deg, #e63946 0%, #f77f00 100%)",
  color: "#ffffff",
  boxShadow: "0 4px 14px rgba(230, 57, 70, 0.35)",
};

const secondaryButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: "#1877F2",
  color: "#ffffff",
  boxShadow: "0 4px 14px rgba(24, 119, 242, 0.35)",
};
