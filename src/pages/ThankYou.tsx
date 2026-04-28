import { useSearchParams } from "react-router";

function ThankYou() {
  const [searchParams] = useSearchParams();
  const submittedItem = (searchParams.get("submit") || "submission").replace(
    /-/g,
    " "
  );

  return (
    <section
      style={{ maxWidth: "600px", margin: "3rem auto" }}
      aria-labelledby="thank-you"
    >
      <div
        className="pixel-box-green"
        style={{
          padding: "2rem",
          background: "#001a05",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(0,204,68,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Title */}
        <div
          id="thank-you"
          style={{
            fontSize: "clamp(10px, 3vw, 16px)",
            color: "var(--green)",
            textShadow: "3px 3px 0 #003311",
            letterSpacing: "3px",
            marginBottom: "1rem",
            animation: "flash-gold 1.5s step-end infinite",
            position: "relative",
          }}
        >
          ✓ THANK YOU!
        </div>

        {/* Big checkmark */}
        <div
          style={{
            fontSize: "clamp(40px, 8vw, 60px)",
            lineHeight: 1,
            marginBottom: "1rem",
            color: "var(--green)",
            animation: "rank-bounce 0.5s ease-out",
            position: "relative",
          }}
        >
          ✓
        </div>

        <div
          style={{
            fontSize: "7px",
            color: "#888",
            marginBottom: "1rem",
            lineHeight: "2.5",
            position: "relative",
          }}
        >
          YOUR {submittedItem.toUpperCase()} HAS BEEN SUBMITTED SUCCESSFULLY.
          <br />
          WE APPRECIATE YOUR TIME AND EFFORT.
        </div>

        {/* Achievement badge */}
        <div
          className="pixel-box-gold"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "#0a0800",
            position: "relative",
          }}
        >
          <div style={{ fontSize: "6px", color: "#555", marginBottom: "4px" }}>
            MISSION STATUS
          </div>
          <div style={{ fontSize: "7px", color: "var(--gold)" }}>
            ★ SUBMITTED SUCCESSFULLY
          </div>
        </div>
      </div>
    </section>
  );
}

export default ThankYou;
