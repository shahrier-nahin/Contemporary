import { Link } from "react-router-dom";

export default function Landing({ onLogout }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f7f6f3",
        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* subtle network/dot background */}
      <NetworkBackground />

      {/* TOP NAV */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          padding: "4px 36px",  // Reduced from 18px to 4px to keep navbar height similar
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(13,27,42,0.08)",
        }}
      >
        <img
          src="https://res.cloudinary.com/dqbsdtrfk/image/upload/v1781174665/news_desk_logos/contemporary_logo.png"
          alt="Contemporary logo"
          style={{ height: 85 }}
        />
      </div>

      {/* HERO */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
        }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#0d1b2a",
            marginBottom: 48,
            letterSpacing: "-1px",
          }}
        >
          Contemporary
        </h1>

        <div
          style={{
            display: "flex",
            gap: 28,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <LandingCard
            to="/fact-checker"
            gradient="linear-gradient(160deg, #17303f 0%, #0d1b2a 100%)"
            accent="#e63946"
            icon={
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="#fff" strokeWidth="2" />
                <path d="M20 20l-4.3-4.3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            title="Fact Checker"
            description="Verify claims with trusted sources."
          />

          <LandingCard
            to="/generator"
            gradient="linear-gradient(160deg, #3d2a4d 0%, #0d1b2a 100%)"
            accent="#6a4c93"
            icon={
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 20l6.5-6.5M14 4l6 6-9.5 9.5H4v-6.5L14 4z"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M18 3l1 1M20 6l1 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            title="Content Generator"
            description="Craft high-quality cards from your sources."
          />
        </div>

        <button
          onClick={onLogout}
          style={{
            marginTop: 40,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 22px",
            borderRadius: 999,
            border: "1px solid rgba(13,27,42,0.15)",
            background: "#fff",
            color: "#0d1b2a",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              stroke="#0d1b2a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Logout
        </button>
      </div>

      {/* FOOTER */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "20px 24px",
          fontSize: 13,
          color: "#888",
        }}
      >
        © {new Date().getFullYear()} Contemporary
      </div>
    </div>
  );
}

/* ============================================================
   LANDING CARD
   ============================================================ */
function LandingCard({ to, gradient, accent, icon, title, description }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        width: 260,
        borderRadius: 20,
        padding: "40px 28px",
        background: gradient,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        boxShadow: "0 12px 32px rgba(13,27,42,0.25)",
        border: `1px solid ${accent}44`,
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 18px 40px rgba(13,27,42,0.32)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(13,27,42,0.25)";
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: `${accent}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {icon}
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 10 }}>
        {title}
      </div>

      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
        {description}
      </div>
    </Link>
  );
}

/* ============================================================
   SUBTLE NETWORK-DOT BACKGROUND
   ============================================================ */
function NetworkBackground() {
  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.25 }}
    >
      <g stroke="#0d1b2a" strokeWidth="1" opacity="0.15">
        <line x1="5%" y1="10%" x2="20%" y2="30%" />
        <line x1="20%" y1="30%" x2="10%" y2="55%" />
        <line x1="10%" y1="55%" x2="25%" y2="75%" />
        <line x1="85%" y1="15%" x2="70%" y2="35%" />
        <line x1="70%" y1="35%" x2="90%" y2="50%" />
        <line x1="90%" y1="50%" x2="78%" y2="70%" />
      </g>
      <g fill="#0d1b2a" opacity="0.25">
        <circle cx="5%" cy="10%" r="3" />
        <circle cx="20%" cy="30%" r="3" />
        <circle cx="10%" cy="55%" r="3" />
        <circle cx="25%" cy="75%" r="3" />
        <circle cx="85%" cy="15%" r="3" />
        <circle cx="70%" cy="35%" r="3" />
        <circle cx="90%" cy="50%" r="3" />
        <circle cx="78%" cy="70%" r="3" />
      </g>
    </svg>
  );
}