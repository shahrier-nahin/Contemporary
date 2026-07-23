import { useEffect, useState } from "react";
import Contemporary from "../templates/Contemporary";
import { downloadCard, getCardBlob } from "../utils/downloadCard";
import { postToFacebook } from "../services/api";

export default function Preview({ state, setState }) {
  const [scale, setScale] = useState(0.62);

  useEffect(() => {
    function updateScale() {
      // Adjust preview container padding/sidebar width dynamically
      const sidebarWidth = window.innerWidth <= 768 ? 32 : 400;
      const availableWidth = window.innerWidth - sidebarWidth;
      const cardWidth = 1080; // template base width

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
      formData.append("summary", state.facebookCaption || "");
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
        maxHeight: "100vh",     // Restricts height to viewport
        overflowY: "auto",      // Enables vertical scrollbar on the right side
        padding: "20px 10px",
        boxSizing: "border-box",
      }}
    >
      {/* 
        Container wrapper to collapse extra whitespace caused by CSS scale transform 
      */}
      <div
        style={{
          width: 1080 * scale,
          height: 1350 * scale, // Adjust if base card height is different
          position: "relative",
          marginBottom: "20px",
          flexShrink: 0,
        }}
      >
        <div
          id="export-card"
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
          <Contemporary state={state} setState={setState} />
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="action-buttons"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
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
          style={buttonStyle}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/724/724933.png"
            alt="download"
            style={{
              width: "18px",
              height: "18px",
              filter: "invert(1)",
            }}
          />
          Download PNG
        </button>

        <button
          className="facebook-btn"
          onClick={handleFacebookPost}
          style={buttonStyle}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
            alt="Facebook"
            style={{ width: "18px", height: "18px", filter: "brightness(0) invert(1)" }}
          />
          Post to Facebook
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  backgroundColor: "#1877F2",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  padding: "10px 16px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  whiteSpace: "nowrap",
};