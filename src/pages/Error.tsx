import BtnLink from "../ui/BtnLink";

function Error({ message = "Something went wrong." }) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      {/* Error icon */}
      <div
        style={{
          fontSize: "clamp(36px, 8vw, 60px)",
          lineHeight: 1,
          marginBottom: "1rem",
          color: "var(--red-light)",
          textShadow: "3px 3px 0 var(--red-dark)",
          animation: "danger-blink 1s step-end infinite",
        }}
      >
        ✕
      </div>

      <div
        style={{
          fontSize: "clamp(8px, 2vw, 12px)",
          color: "var(--red-light)",
          letterSpacing: "3px",
          marginBottom: "1.5rem",
        }}
      >
        ⚠ SYSTEM ERROR
      </div>

      <div
        className="pixel-box"
        style={{
          padding: "1.5rem 2rem",
          background: "var(--dark2)",
          marginBottom: "2rem",
          maxWidth: "500px",
        }}
      >
        <p style={{ fontSize: "7px", color: "#888", lineHeight: "2.5", marginBottom: "1rem" }}>
          {message}
        </p>
        <p style={{ fontSize: "6px", color: "#555", lineHeight: "2.5" }}>
          IF YOU BELIEVE THIS IS A MISTAKE, CONTACT:
          <br />
          <a
            href="mailto:apec.support.premium@apeceg.com"
            style={{
              color: "var(--blue)",
              textDecoration: "none",
              letterSpacing: "1px",
            }}
          >
            apec.support.premium@apeceg.com
          </a>
        </p>
      </div>

      {message === "The quiz has already been submitted." ? (
        <a
          href="https://apeceg.com/"
          style={{
            fontFamily: "var(--pixel)",
            fontSize: "8px",
            padding: "12px 20px",
            border: "2px solid var(--red)",
            background: "var(--red-dark)",
            color: "var(--white)",
            textDecoration: "none",
            display: "inline-block",
            letterSpacing: "1px",
          }}
        >
          ▶ GO TO APEC MAIN SITE
        </a>
      ) : (
        <BtnLink to="/" title="RETURN TO HOME" />
      )}
    </div>
  );
}

export default Error;
