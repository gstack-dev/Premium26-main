import { Link } from "react-router";

function BtnLink({ to, title }: { to: string; title: string }) {
  return (
    <Link
      to={to}
      style={{
        fontFamily: "var(--pixel)",
        fontSize: "8px",
        padding: "12px 20px",
        border: "2px solid var(--red)",
        background: "var(--red-dark)",
        color: "var(--white)",
        textDecoration: "none",
        textTransform: "uppercase",
        letterSpacing: "1px",
        display: "inline-block",
        transition: "all 0.1s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "var(--red)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background =
          "var(--red-dark)";
      }}
    >
      ▶ {title}
    </Link>
  );
}

export default BtnLink;
