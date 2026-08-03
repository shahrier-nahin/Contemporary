import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRemaining } from "./services/api";
import Editor from "./components/Editor";
import Preview from "./components/Preview";

export default function GeneratorApp({onLogout}) {
  const [state, setState] = useState({
    template: "contemporary",
    articleUrl: "",
    headline: "আপনার শিরোনাম এখানে আসবে",
    summary: "",
    hashtags: "",
    highlightWord: "",
    highlightColor: "#E63946",
    subcategory: "ফিফা বিশ্বকাপ",
    source: "The Contemporary",
    date: new Date().toLocaleDateString("bn-BD"),
    remaining: 14,
    background: null,
    articleBackground: null,
    backgroundOpacity: 0.95,
    backgroundBrightness: 1.15,
    backgroundBlur: 0,
    backgroundPosition: "center",
    dailyLimit: 14,
  });

  useEffect(() => {
    async function loadRemaining() {
      try {
        const data = await getRemaining();
        setState((prev) => ({ ...prev, remaining: data.remaining }));
      } catch (err) {
        console.error("Failed to load remaining:", err);
      }
    }
    loadRemaining();
  }, []);

  return (
    <div className="app-container">
      <div style={topNavigationStyle}>
        <Link
          to="/"
          style={backLinkStyle}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "#F3F4F6";
            event.currentTarget.style.boxShadow = "0 4px 12px rgba(13, 27, 42, 0.12)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "#FFFFFF";
            event.currentTarget.style.boxShadow = "none";
          }}
        >
          Back to landing page
        </Link>
      </div>
      <Editor state={state} setState={setState} onLogout={onLogout} />
      <Preview state={state} setState={setState} />
    </div>
  );
}

const topNavigationStyle = {
  position: "fixed",
  top: 20,
  right: 24,
  zIndex: 1000,
};

const backLinkStyle = {
  display: "inline-block",
  padding: "10px 16px",
  borderRadius: 8,
  background: "#FFFFFF",
  color: "#0D1B2A",
  border: "1px solid #E5E7EB",
  fontSize: 14,
  fontWeight: 600,
  textDecoration: "none",
  boxShadow: "none",
  transition: "background 0.15s ease, box-shadow 0.15s ease",
};
