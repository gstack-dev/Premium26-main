import QRCode from "react-qr-code";
import { Link, useLocation } from "react-router";

const publicBasePath = "/APEC26_Premium_main";

function getPublicUrl(path: string) {
  return `${window.location.origin}${publicBasePath}${path}`;
}

function PstComplete() {
  const location = useLocation();
  const result = location.state as { score: number; total_questions: number; percentage: number } | undefined;
  
  const score = result?.score ?? 0;
  const isFailed = score < 30;
  
  const internshipsUrl = getPublicUrl("/internships");

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
          {isFailed ? "⚔ PST SUBMITTED ⚔" : "⚡ MISSION COMPLETE ⚡"}
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
          {isFailed ? "✓" : "S"}
        </div>

        <div
          style={{
            fontSize: "7px",
            color: "#666",
            marginBottom: "2rem",
            letterSpacing: "2px",
          }}
        >
          {isFailed ? "TEST COMPLETED SUCCESSFULLY" : "PST SUBMITTED SUCCESSFULLY"}
        </div>

        {!isFailed ? (
          <>
            {/* ... success content ... */}
            <div
              className="pixel-box-gold"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#0a0800",
                marginBottom: "2rem",
              }}
            >
              <div style={{ fontSize: "6px", color: "#555", marginBottom: "4px" }}>
                ACHIEVEMENT UNLOCKED
              </div>
              <div style={{ fontSize: "8px", color: "var(--gold)" }}>
                🏆 PST CHAMPION
              </div>
            </div>

            {/* QR Code */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p
                style={{
                  fontSize: "7px",
                  color: "#888",
                  marginBottom: "1rem",
                  letterSpacing: "1px",
                }}
              >
                ► SCAN TO SELECT INTERNSHIP COMPANIES
              </p>
              <div
                className="pixel-box-gold"
                style={{
                  display: "inline-block",
                  padding: "16px",
                  background: "var(--white)",
                }}
              >
                <QRCode value={internshipsUrl} size={160} />
              </div>
              <p
                style={{
                  fontSize: "6px",
                  color: "#555",
                  marginTop: "1rem",
                }}
              >
                OR USE THE DIRECT LINK BELOW
              </p>
            </div>

            <Link
              to="/internships"
              className="pixel-btn"
              style={{
                fontFamily: "var(--pixel)",
                fontSize: "8px",
                padding: "12px 20px",
                border: "2px solid var(--gold)",
                background: "#553300",
                color: "var(--gold)",
                textDecoration: "none",
                display: "inline-block",
                letterSpacing: "1px",
              }}
            >
              ► SELECT INTERNSHIPS
            </Link>
          </>
        ) : (
          <div style={{ padding: "1rem" }}>
            <p style={{ fontSize: "7px", color: "#888", lineHeight: "2.5", letterSpacing: "1px" }}>
              THANK YOU FOR COMPLETING THE PST.
              <br />
              WE WILL REVIEW YOUR SUBMISSION AND NOTIFY
              <br />
              YOU OF THE NEXT STEPS VIA EMAIL.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default PstComplete;
