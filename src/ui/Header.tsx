function Header() {
  return (
    <header
      style={{
        background: "var(--red-dark)",
        borderBottom: "4px solid var(--red)",
        padding: "1.5rem 2rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Pixel grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 16px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {/* Logos */}
        <img
          className="spinner"
          style={{ height: "48px", imageRendering: "pixelated" }}
          src={`${import.meta.env.BASE_URL}apecLogo.png`}
          alt="APEC Logo"
        />
        <div>
          <div
            style={{
              fontSize: "clamp(8px, 2vw, 14px)",
              color: "var(--white)",
              textShadow: "3px 3px 0 var(--red-dark)",
              letterSpacing: "2px",
            }}
          >
            ▶ APEC PREMIUM 26
          </div>
          <div
            style={{
              fontSize: "6px",
              color: "var(--gold)",
              marginTop: "6px",
              letterSpacing: "2px",
            }}
          >
            ★ IN CHARGE OF CHANGE ★
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
