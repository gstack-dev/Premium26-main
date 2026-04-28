import QRCode from "react-qr-code";
import { Link } from "react-router";
import NotFound from "./NotFound";
import { RegisterStudentResponse } from "../types/form";

const publicBasePath = "/APEC26_Premium_main";

function getPublicUrl(path: string) {
  return `${window.location.origin}${publicBasePath}${path}`;
}

function getStoredStudent(): RegisterStudentResponse | null {
  const stored = localStorage.getItem("premium26Student");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as RegisterStudentResponse;
  } catch {
    return null;
  }
}

function Success() {
  const studentData = getStoredStudent();

  if (!studentData) return <NotFound />;

  const pstUrl = getPublicUrl("/pst");

  return (
    <section style={{ maxWidth: "700px", margin: "3rem auto" }}>
      {/* ── Quest Accepted header ── */}
      <div
        className="pixel-box-green"
        style={{
          padding: "1.5rem 2rem",
          background: "#001a05",
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            fontSize: "clamp(9px, 2.5vw, 14px)",
            color: "var(--green)",
            letterSpacing: "3px",
            animation: "flash-gold 1.5s step-end infinite",
          }}
        >
          ✓ QUEST ACCEPTED!
        </div>
        <div style={{ fontSize: "7px", color: "#888", marginTop: "8px" }}>
          YOUR PREMIUM 26 APPLICATION WAS SUBMITTED SUCCESSFULLY
        </div>
      </div>

      {/* ── PST QR Section ── */}
      <div
        className="pixel-box"
        style={{ padding: "2rem", background: "var(--dark2)", textAlign: "center", marginBottom: "1.5rem" }}
      >
        <p
          style={{
            fontSize: "8px",
            color: "var(--gold)",
            marginBottom: "1.5rem",
            letterSpacing: "1px",
          }}
        >
          ★ NEXT MISSION: TAKE THE PST
        </p>

        <p
          style={{
            fontSize: "6px",
            color: "#888",
            marginBottom: "1rem",
            letterSpacing: "1px",
          }}
        >
          ► SCAN TO START THE PST
        </p>

        <div
          className="pixel-box-gold"
          style={{
            display: "inline-block",
            padding: "16px",
            background: "var(--white)",
            marginBottom: "1.5rem",
          }}
        >
          <QRCode value={pstUrl} size={160} />
        </div>

        <p style={{ fontSize: "6px", color: "#555", marginBottom: "1rem" }}>
          OR USE THE DIRECT LINK BELOW
        </p>

        <Link
          to="/pst"
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
          ► START PST
        </Link>
      </div>



      {/* ── Warning Section ── */}
      <div
        style={{
          background: "#0d0000",
          border: "2px solid var(--red-dark)",
          padding: "1.5rem",
        }}
      >
        <p
          style={{
            fontSize: "7px",
            color: "var(--red-light)",
            marginBottom: "0.75rem",
            letterSpacing: "1px",
          }}
        >
          ⚠ IMPORTANT NOTICES:
        </p>
        <div style={{ fontSize: "6px", color: "#666", lineHeight: "3" }}>
          <p>▸ You are only allowed to take the PST once.</p>
          <p>▸ Do not refresh the PST page while taking it.</p>
          <p>▸ Do not share your application details with anyone.</p>
          <p>▸ Switching away from the PST page may submit your answers.</p>
        </div>
      </div>
    </section>
  );
}

export default Success;
