import type { ReactNode } from "react";

// Templates remount on navigation, so the enter animation plays for every route.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
