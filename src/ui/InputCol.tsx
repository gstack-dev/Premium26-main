import { ReactNode } from "react";

function InputCol({ children }: { children: ReactNode }) {
  return <div style={{ flex: 1, minWidth: 0 }}>{children}</div>;
}

export default InputCol;
