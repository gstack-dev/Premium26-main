import { Outlet } from "react-router";
import Header from "./Header";

function AppLayout() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "var(--dark)",
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      }}
    >
      <Header />
      <main className="flex-1 px-2 md:px-6 lg:px-16 pb-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "#060606",
          borderTop: "3px solid var(--red-dark)",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "6px", color: "#333", letterSpacing: "2px" }}>
          APEC | PREMIUM 26 — 2D PIXEL ART THEME
        </div>
        <div
          style={{
            fontSize: "5px",
            color: "#222",
            marginTop: "6px",
            letterSpacing: "1px",
          }}
        >
          ★ IN CHARGE OF CHANGE — 20th ANNIVERSARY ★
        </div>
        <div style={{ fontSize: "5px", color: "#222", marginTop: "4px" }}>
          PRESS START TO CONTINUE...
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
