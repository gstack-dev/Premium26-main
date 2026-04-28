import { useLocation, useNavigate } from "react-router";
import Button from "../../ui/Button";

function StartQuiz() {
  const x = useLocation();
  const navigate = useNavigate();

  function goToQuiz() {
    const path = x.search;
    navigate(`/stquiz${path}`, { replace: true });
  }

  return (
    <section style={{ maxWidth: "700px", margin: "3rem auto" }}>
      {/* Title bar */}
      <div
        style={{
          background: "var(--red-dark)",
          borderBottom: "3px solid var(--red)",
          padding: "1rem 1.5rem",
        }}
      >
        <div style={{ fontSize: "10px", color: "var(--white)" }}>
          ⚔ PST RULES
        </div>
        <div style={{ fontSize: "6px", color: "#cc6666", marginTop: "4px" }}>
          READ CAREFULLY BEFORE STARTING
        </div>
      </div>

      <div
        className="pixel-box"
        style={{ padding: "2rem", background: "var(--dark2)", borderTop: "none" }}
      >
        <p
          style={{
            fontSize: "7px",
            color: "#888",
            marginBottom: "2rem",
            lineHeight: "2.5",
          }}
        >
          PLEASE READ ALL RULES BELOW BEFORE STARTING:
        </p>

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            marginBottom: "2rem",
          }}
        >
          {[
            "EXAM DURATION: 45 MINUTES",
            "TOTAL QUESTIONS: 70 QUESTIONS",
            "YOU ARE ALLOWED TO TAKE THE PST ONLY ONCE.",
            "DO NOT REFRESH THE EXAM PAGE DURING THE TEST.",
            "DO NOT SHARE THE EXAM LINK WITH ANYONE.",
            "MAKE SURE TO START BEFORE THE EVENT ENDS.",
          ].map((rule, i) => (
            <li
              key={i}
              style={{
                fontFamily: "var(--pixel)",
                fontSize: "6px",
                color: i === 0 || i === 1 ? "var(--gold)" : "#888",
                padding: "8px 0",
                borderBottom: "1px solid #1a1a1a",
                lineHeight: "2",
              }}
            >
              ▸ {rule}
            </li>
          ))}
          <li
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "6px",
              color: "var(--red-light)",
              padding: "8px 0",
              lineHeight: "2",
              animation: "danger-blink 1s step-end infinite",
            }}
          >
            ⚠ SWITCHING TABS, MINIMIZING, COPYING, OR SCREENSHOTS = INSTANT SUBMISSION
          </li>
        </ul>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button onClick={goToQuiz} type="button" variant="red">
            ▶ START PST NOW
          </Button>
        </div>
      </div>
    </section>
  );
}

export default StartQuiz;
