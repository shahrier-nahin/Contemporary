import { useEffect, useState } from "react";
import Contemporary from "../templates/Contemporary";
import { downloadCard, getCardBlob } from "../utils/downloadCard";
import { postToFacebook } from "../services/api";

export default function Preview({ state, setState}) {
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
    <div className="preview">
      <div id="export-card" className="preview-frame">
        <Contemporary state={state} />
      </div>

      <div className="action-buttons">
        <button
          className="download-btn"
          onClick={() => downloadCard("export-card")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/724/724933.png"
            alt="download"
            style={{
              width: "18px",
              height: "18px",
              marginRight: "8px",
              filter: "invert(0)",
            }}
          />
          Download PNG
        </button>

        <button className="facebook-btn" onClick={handleFacebookPost}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
            alt="Facebook"
            style={{ width: "18px", height: "18px", marginRight: "8px" }}
          />
          Post to Facebook
        </button>
      </div>
    </div>
  );

  <Contemporary state={state} setState={setState} />
}
