function Heading() {
  return (
    <div style={{ textAlign: "center", margin: "2rem 0" }}>
      <h2
        style={{
          fontSize: "clamp(10px, 2.5vw, 18px)",
          color: "var(--red-light)",
          textShadow: "3px 3px 0 var(--red-dark)",
          letterSpacing: "4px",
        }}
      >
        APEC&apos;26
      </h2>
      <h3
        style={{
          fontSize: "clamp(8px, 2vw, 14px)",
          color: "var(--gold)",
          letterSpacing: "6px",
          marginTop: "8px",
        }}
      >
        PREMIUM
      </h3>
    </div>
  );
}

export default Heading;
