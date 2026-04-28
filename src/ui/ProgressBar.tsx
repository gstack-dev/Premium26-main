function ProgressBar({
  currentStep,
  setCurrentStep,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) {
  const totalSteps = 4;

  return (
    <div style={{ position: "relative", width: "100%", margin: "0 auto 2rem" }}>
      {/* Track */}
      <div
        style={{
          height: "4px",
          background: "#1a1a1a",
          border: "1px solid #333",
          position: "relative",
          margin: "16px 0",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            background: "var(--red)",
            transition: "width 0.5s",
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
        />
      </div>

      {/* Step dots */}
      <ul
        style={{
          position: "absolute",
          top: "8px",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isComplete = step <= currentStep;
          return (
            <li key={index}>
              <button
                style={{
                  width: "28px",
                  height: "28px",
                  fontFamily: "var(--pixel)",
                  fontSize: "7px",
                  border: `2px solid ${isComplete ? "var(--red)" : "#333"}`,
                  background: isComplete ? "var(--red-dark)" : "#0a0a0a",
                  color: isComplete ? "var(--white)" : "#555",
                  cursor: step > currentStep ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => {
                  if (step > currentStep) return;
                  setCurrentStep(step);
                }}
              >
                {isComplete && step < currentStep ? "✓" : step}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ProgressBar;
