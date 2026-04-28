import { ReactNode } from "react";

function InputGroup({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
      }}
    >
      {children}
    </div>
  );
}

export default InputGroup;
