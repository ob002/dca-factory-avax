"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",          label: "Dashboard" },
  { href: "/vaults",    label: "Vaults"    },
  { href: "/analytics", label: "Analytics" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav style={{
      background: "#0A0A0A", borderBottom: "1px solid #222",
      padding: "0 2rem", height: "64px", display: "flex",
      alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <Image src="/logo.svg" alt="DCA Factory" width={36} height={36} />
        <span style={{ color: "#F5F5F5", fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.05em" }}>
          DCA<span style={{ color: "#E84142" }}>FACTORY</span>
        </span>
      </Link>
      <div style={{ display: "flex", gap: "2rem" }}>
        {NAV_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} style={{
            color: pathname === href ? "#E84142" : "#888",
            textDecoration: "none",
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase",
            borderBottom: pathname === href ? "1px solid #E84142" : "1px solid transparent",
            paddingBottom: "2px", transition: "color 0.2s",
          }}>
            {label}
          </Link>
        ))}
      </div>
      <ConnectButton chainStatus="icon" showBalance={false} />
    </nav>
  );
}
