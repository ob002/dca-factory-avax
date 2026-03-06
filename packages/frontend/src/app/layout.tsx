import type { Metadata } from "next";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "DCA Factory — Avalanche",
  description: "Automated Dollar Cost Averaging on Avalanche. Buy AVAX automatically, earn yield via Benqi, track gas for Retro9000.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0A0A0A", minHeight: "100vh" }}>
        <Providers>
          <Navbar />
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
