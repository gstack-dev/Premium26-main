import { useEffect, useState } from "react";
import { resumeAudio, usePixelSound } from "../services/usePixelSound";

/**
 * Pac-Man inline spinner — used when loading PST questions / preloading images.
 * When `progress` (0-100) is provided, a pixel-art block progress bar is shown.
 */
function Spinner({
  progress,
  label,
}: {
  progress?: number; // 0-100 when determinate, undefined = indeterminate
  label?: string;
}) {
  const [frame, setFrame] = useState(0);
  const play = usePixelSound();

  // Pac-Man mouth animation
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 180);
    return () => clearInterval(id);
  }, []);

  // Soft loading beep — stop when fully loaded
  useEffect(() => {
    if (progress === 100) return;
    resumeAudio();
    const id = setInterval(() => play("loader"), 800);
    return () => clearInterval(id);
  }, [play, progress]);

  const mouthAngle = [40, 20, 5, 20][frame];
  const r = 14;
  const cx = r + 2;
  const cy = r + 2;
  const rad = (mouthAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(-rad);
  const y1 = cy + r * Math.sin(-rad);
  const x2 = cx + r * Math.cos(rad);
  const y2 = cy + r * Math.sin(rad);
  const pacPath =
    mouthAngle < 3
      ? `M${cx},${cy} m-${r},0 a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 -${r * 2},0`
      : `M${cx},${cy} L${x1},${y1} A${r},${r} 0 1,1 ${x2},${y2} Z`;

  const dotCount = 8;
  const eatenDots = frame % (dotCount + 1);

  const isDeterminate = progress !== undefined;
  const pct = Math.min(Math.max(progress ?? 0, 0), 100);
  const totalBlocks = 20;
  const filledBlocks = Math.round((pct / 100) * totalBlocks);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem",
        gap: "1.2rem",
      }}
    >
      {/* Pac-Man row */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "32px" }}>
        <svg
          width={cx * 2 + 4}
          height={cy * 2 + 4}
          style={{ flexShrink: 0, imageRendering: "pixelated" }}
        >
          <path d={pacPath} fill="var(--gold)" />
          <rect x={cx + 2} y={cy - 8} width={3} height={3} fill="var(--dark)" />
        </svg>

        {/* Dots track — indeterminate only */}
        {!isDeterminate && (
          <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
            {Array.from({ length: dotCount }).map((_, i) => {
              const eaten = i < eatenDots;
              return (
                <div
                  key={i}
                  style={{
                    width: eaten ? "0px" : "6px",
                    height: eaten ? "0px" : "6px",
                    background: "var(--gold)",
                    border: eaten ? "none" : "1px solid #aa8800",
                    opacity: eaten ? 0 : 1,
                    transition: "all 0.12s step-end",
                    imageRendering: "pixelated",
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Pixel block progress bar — determinate only */}
      {isDeterminate && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              display: "flex",
              gap: "3px",
              padding: "4px",
              border: "2px solid #333",
              background: "#0a0a0a",
            }}
          >
            {Array.from({ length: totalBlocks }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "10px",
                  height: "14px",
                  background: i < filledBlocks ? "var(--gold)" : "#1a1a1a",
                  border: i < filledBlocks ? "1px solid #aa8800" : "1px solid #222",
                  transition: "background 0.1s step-end",
                  imageRendering: "pixelated",
                }}
              />
            ))}
          </div>

          <div
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "7px",
              color: "var(--gold)",
              letterSpacing: "2px",
            }}
          >
            {pct}%
          </div>
        </div>
      )}

      {/* Label */}
      <div
        style={{
          fontFamily: "var(--pixel)",
          fontSize: "7px",
          color: "#555",
          letterSpacing: "2px",
          animation: "blink 1s step-end infinite",
        }}
      >
        {label ?? "LOADING QUESTIONS..."}
      </div>
    </div>
  );
}

export default Spinner;
