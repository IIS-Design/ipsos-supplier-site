import type { ReactNode } from "react";

export function SettingsLayout({ navigation, children }: { navigation: ReactNode; children: ReactNode }) {
  return <div className="grid min-w-0 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
    <aside className="lg:border-r lg:pr-6 lg:pt-10">{navigation}</aside>
    <div className="min-w-0">{children}</div>
  </div>;
}
