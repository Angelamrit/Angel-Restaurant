import type { ReactNode } from "react";

// The root template remounts when the top-level route segment changes.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
