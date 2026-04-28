import { useEffect, useRef, useState } from "react";
import { resumeAudio, usePixelSound } from "../services/usePixelSound";

/* ─────────────────────────────────────────────
   Page Spinner — full-screen game boot screen
───────────────────────────────────────────── */

function PageSpinner() {
  const [dots, setDots] = useState(0);
  const [press, setPress] = useState(false);
  const [gemReady, setGemReady] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const play = usePixelSound();

  // If the image is already in cache (preloaded), mark ready immediately
  useEffect(() => {
    if (imgRef.current?.complete) setGemReady(true);
  }, []);

  // Soft loading beep
  useEffect(() => {
    resumeAudio();
    const id = setInterval(() => play("loader"), 800);
    return () => clearInterval(id);
  }, [play]);

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setPress((p) => !p), 700);
    return () => clearInterval(id);
  }, []);

  const loadingText = "LOADING" + ".".repeat(dots);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Pixel grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(204,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(204,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          zIndex: 1,
        }}
      />

      {/* HP / XP bars — game HUD */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          right: "16px",
          display: "flex",
          justifyContent: "space-between",
          zIndex: 3,
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* HP bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "var(--pixel)", fontSize: "7px", color: "#ff4444", whiteSpace: "nowrap" }}>HP:</span>
          <div style={{ width: "120px", height: "10px", background: "#1a1a1a", border: "2px solid #550000", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, width: "78%", background: "var(--red)" }} />
            <div style={{ position: "absolute", top: "2px", left: "3px", right: "3px", height: "2px", background: "rgba(255,255,255,0.25)" }} />
          </div>
          <span style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#ff6666" }}>240/250</span>
        </div>

        {/* XP bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "var(--pixel)", fontSize: "7px", color: "#ffcc00", whiteSpace: "nowrap" }}>XP:</span>
          <div style={{ width: "120px", height: "10px", background: "#1a1a1a", border: "2px solid #553300", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, width: "92%", background: "#ffcc00" }} />
            <div style={{ position: "absolute", top: "2px", left: "3px", right: "3px", height: "2px", background: "rgba(255,255,255,0.3)" }} />
          </div>
          <span style={{ fontFamily: "var(--pixel)", fontSize: "6px", color: "#ffee66" }}>1850/1000</span>
        </div>
      </div>

      {/* Main content — hidden until diamond.png is loaded */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: "var(--pixel)",
            fontSize: "clamp(12px, 2.5vw, 22px)",
            color: "var(--red-light)",
            textShadow: "4px 4px 0 var(--red-dark), 0 0 30px rgba(204,0,0,0.6)",
            letterSpacing: "4px",
            textAlign: "center",
            lineHeight: "2",
            animation: "page-title-pulse 2s ease-in-out infinite",
          }}
        >
          APEC PREMIUM — THE QUEST
        </div>

        {/* Portal ring + crystal */}
        <div
          style={{
            position: "relative",
            width: "240px",
            height: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Outer ring glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "6px solid var(--red)",
              boxShadow:
                "0 0 0 4px var(--red-dark), 0 0 40px 10px rgba(204,0,0,0.5), inset 0 0 30px rgba(204,0,0,0.3)",
              animation: "portal-spin 3s linear infinite",
            }}
          />
          {/* Inner portal */}
          <div
            style={{
              position: "absolute",
              inset: "12px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(180,0,0,0.6) 0%, rgba(50,0,0,0.85) 60%, #0a0a0a 100%)",
              animation: "portal-breathe 2s ease-in-out infinite",
            }}
          />
          {/* Pixel sparks around ring */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "4px",
                height: "4px",
                background: "#fff",
                transform: `rotate(${deg}deg) translateX(112px)`,
                animation: `spark-twinkle 1.2s ${i * 0.15}s step-end infinite`,
              }}
            />
          ))}

          {/* ── Diamond gem image ── */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "crystal-reveal 1.2s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {/* Rotating halo behind the gem */}
            <div
              style={{
                position: "absolute",
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(220,0,0,0.35) 0%, transparent 70%)",
                animation: "crystal-inner 2s ease-in-out infinite alternate",
              }}
            />
            <img
              ref={imgRef}
              src={`${import.meta.env.BASE_URL}diamond.png`}
              alt="APEC gem"
              onLoad={() => setGemReady(true)}
              style={{
                width: "160px",
                height: "160px",
                imageRendering: "pixelated",
                objectFit: "contain",
                filter: "drop-shadow(0 0 12px rgba(220,0,0,0.95)) drop-shadow(0 0 24px rgba(180,0,0,0.5))",
                animation: gemReady ? "crystal-shine 3s 1.4s ease-in-out infinite" : "none",
                position: "relative",
                zIndex: 1,
              }}
            />
          </div>
        </div>

        {/* Loading bar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "280px",
              height: "18px",
              background: "#111",
              border: "3px solid var(--red-dark)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 0 12px rgba(204,0,0,0.4)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, var(--red-dark), var(--red))",
                animation: "page-load-bar 1.8s ease-in-out infinite alternate",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(0,0,0,0.3) 18px, rgba(0,0,0,0.3) 20px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: "4px",
                right: "4px",
                height: "4px",
                background: "rgba(255,255,255,0.2)",
              }}
            />
          </div>
          <div
            style={{
              fontFamily: "var(--pixel)",
              fontSize: "7px",
              color: "#555",
              letterSpacing: "2px",
              animation: "blink 0.8s step-end infinite",
            }}
          >
            {loadingText}
          </div>
        </div>

        {/* Press any button */}
        <div
          style={{
            fontFamily: "var(--pixel)",
            fontSize: "clamp(8px, 1.5vw, 11px)",
            letterSpacing: "2px",
            opacity: press ? 1 : 0,
            transition: "opacity 0.1s step-end",
            marginTop: "0.5rem",
          }}
        >
          PRESS ANY{" "}
          <span style={{ color: "var(--gold)", textShadow: "2px 2px 0 #553300" }}>
            BUTTON
          </span>{" "}
          TO START
        </div>
      </div>

      {/* Version */}
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          right: "16px",
          fontFamily: "var(--pixel)",
          fontSize: "6px",
          color: "#333",
          zIndex: 3,
        }}
      >
        PREMIUM 26 v1.0
      </div>
    </div>
  );
}

export default PageSpinner;
