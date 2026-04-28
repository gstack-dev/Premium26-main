import BtnLink from "../ui/BtnLink";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* 404 big display */}
        <div
          style={{
            fontSize: "clamp(48px, 12vw, 96px)",
            color: "var(--gold)",
            textShadow: "0 0 20px var(--gold), 4px 4px 0 #553300",
            lineHeight: 1,
            marginBottom: "0.5rem",
            animation: "rank-bounce 0.5s ease-out",
          }}
        >
          404
        </div>

        <div
          style={{
            fontSize: "clamp(8px, 2vw, 14px)",
            color: "var(--red-light)",
            textShadow: "3px 3px 0 var(--red-dark)",
            letterSpacing: "3px",
            marginBottom: "1.5rem",
            animation: "flash-gold 2s step-end infinite",
          }}
        >
          ✕ GAME OVER
        </div>

        <div
          className="pixel-box"
          style={{
            padding: "1.5rem 2rem",
            background: "var(--dark2)",
            display: "inline-block",
            marginBottom: "2rem",
          }}
        >
          <div style={{ fontSize: "7px", color: "#666", lineHeight: "2.5" }}>
            THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST.
            <br />
            RETURNING TO THE MAP...
          </div>
        </div>

        <div>
          <BtnLink to="/" title="RETURN TO HOME" />
        </div>
      </div>
    </div>
  );
}

export default NotFound;
