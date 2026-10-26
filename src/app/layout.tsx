import type { Metadata } from "next";
import "./globals.css";
import { PrototypeEnvironment } from "@/components/prototype-tools";

export const metadata: Metadata = {
  title: {
    default: "Ipsos Supplier Portal",
    template: "%s | Ipsos Supplier Portal",
  },
  description: "Operational workspace for Ipsos sample suppliers.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PrototypeEnvironment>{children}</PrototypeEnvironment>
      </body>
    </html>
  );
}
