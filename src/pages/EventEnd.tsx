function EventEnd() {
  return (
    <section style={{ maxWidth: "600px", margin: "3rem auto" }}>
      <div
        className="pixel-box"
        style={{ padding: "2rem", background: "var(--dark2)", textAlign: "center" }}
      >
        <div
          style={{
            fontSize: "clamp(8px, 2.5vw, 14px)",
            color: "var(--red-light)",
            textShadow: "3px 3px 0 var(--red-dark)",
            letterSpacing: "3px",
            marginBottom: "1.5rem",
            animation: "flash-gold 2s step-end infinite",
          }}
        >
          ⚡ EVENT HAS ENDED ⚡
        </div>
        <img
          style={{
            width: "200px",
            margin: "0 auto 1.5rem",
            display: "block",
            imageRendering: "pixelated",
          }}
          src="https://apeceg.com/APEC-Premium-2025/7.svg"
          alt="Event Ended"
        />
        <p
          style={{
            fontSize: "7px",
            color: "#666",
            lineHeight: "2.5",
            marginBottom: "1.5rem",
          }}
        >
          FOLLOW OUR PAGE TO STAY UPDATED ABOUT UPCOMING EVENTS!
        </p>
        <a
          href="https://www.facebook.com/APECeg/"
          target="_blank"
          rel="noreferrer"
          style={{
            fontFamily: "var(--pixel)",
            fontSize: "8px",
            padding: "12px 20px",
            border: "2px solid var(--blue)",
            background: "#001133",
            color: "var(--blue)",
            textDecoration: "none",
            display: "inline-block",
            letterSpacing: "1px",
          }}
        >
          ► FOLLOW US
        </a>
      </div>
    </section>
  );
}

export default EventEnd;
