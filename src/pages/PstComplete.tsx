function PstComplete() {

  return (
    <section style={{ maxWidth: "700px", margin: "3rem auto" }}>
      {/* Mission complete header */}
      <div
        className="pixel-box"
        style={{ padding: "2rem", background: "#000", textAlign: "center", position: "relative", overflow: "hidden" }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, rgba(204,0,0,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            fontSize: "clamp(8px, 2.5vw, 14px)",
            color: "var(--gold)",
            textShadow: "3px 3px 0 #553300",
            letterSpacing: "3px",
            marginBottom: "1.5rem",
            position: "relative",
          }}
        >
          ⚔ PST SUBMITTED ⚔
        </div>

        <div
          style={{
            fontSize: "clamp(40px,8vw,64px)",
            lineHeight: 1,
            marginBottom: "0.5rem",
            animation: "rank-bounce 0.5s ease-out",
            color: "var(--gold)",
            textShadow: "0 0 20px var(--gold)",
            position: "relative",
          }}
        >
          ✓
        </div>

        <div
          style={{
            fontSize: "7px",
            color: "#666",
            marginBottom: "2rem",
            letterSpacing: "2px",
          }}
        >
          TEST COMPLETED SUCCESSFULLY
        </div>

        <div style={{ padding: "1rem" }}>
          <p style={{ fontSize: "7px", color: "#888", lineHeight: "2.5", letterSpacing: "1px" }}>
            THANK YOU FOR COMPLETING THE PST.
            <br />
            WE WILL REVIEW YOUR SUBMISSION AND SEND YOU
            <br />
            AN EMAIL TO CHOOSE THE INTERNSHIPS.
          </p>
        </div>
      </div>
    </section>
  );
}

export default PstComplete;
