import React from "react";

type ButtonVariant = "red" | "gold" | "green" | "blue";

const variantStyles: Record<
  ButtonVariant,
  { border: string; background: string; color: string; hoverBg: string }
> = {
  red: {
    border: "var(--red)",
    background: "var(--red-dark)",
    color: "var(--white)",
    hoverBg: "var(--red)",
  },
  gold: {
    border: "var(--gold)",
    background: "#553300",
    color: "var(--gold)",
    hoverBg: "#885500",
  },
  green: {
    border: "var(--green)",
    background: "#003311",
    color: "var(--green)",
    hoverBg: "#005522",
  },
  blue: {
    border: "var(--blue)",
    background: "#001133",
    color: "var(--blue)",
    hoverBg: "#002266",
  },
};

function Button({
  children,
  type,
  onClick,
  isLoading,
  variant = "red",
  fullWidth = false,
  style,
}: {
  children: string | JSX.Element;
  type: "submit" | "reset" | "button" | undefined;
  isLoading?: boolean;
  onClick?: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}) {
  const v = variantStyles[variant];
  return (
    <button
      style={{
        marginRight: children === "previous" ? "auto" : undefined,
        marginLeft: children !== "previous" ? "auto" : undefined,
        fontFamily: "var(--pixel)",
        fontSize: "9px",
        padding: "12px 24px",
        border: `2px solid ${v.border}`,
        background: v.background,
        color: v.color,
        cursor: isLoading ? "not-allowed" : "pointer",
        textTransform: "uppercase",
        letterSpacing: "1px",
        transition: "all 0.1s",
        opacity: isLoading ? 0.6 : 1,
        display: "block",
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
      disabled={isLoading}
      type={type}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isLoading)
          (e.currentTarget as HTMLButtonElement).style.background = v.hoverBg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = v.background;
      }}
    >
      {isLoading ? "▶ LOADING..." : children}
    </button>
  );
}

export default Button;
