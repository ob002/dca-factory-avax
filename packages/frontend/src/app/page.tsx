"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useVault } from "@/hooks/useVault";

const STATS = [
  { label: "Total Invested",   value: "$0.00",  sub: "USDC deployed"     },
  { label: "AVAX Accumulated", value: "0.000",  sub: "via DCA executions" },
  { label: "Yield Earned",     value: "$0.00",  sub: "from Benqi qiAVAX" },
  { label: "Gas Tracked",      value: "0",      sub: "for Retro9000"     },
];

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const { vaultAddress, allVaults } = useVault();

  const hasVault = vaultAddress &&
    vaultAddress !== "0x0000000000000000000000000000000000000000";

  if (!isConnected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "4rem" }}>⬡</div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Dollar Cost Average<br />
          <span style={{ color: "#E84142" }}>on Avalanche</span>
        </h1>
        <p style={{ color: "#888", maxWidth: "400px", lineHeight: 1.6, fontSize: "0.9rem" }}>
          Automate USDC → AVAX purchases. Earn yield via Benqi. Track gas for Retro9000 rewards.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "#888", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Portfolio Overview</p>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </h1>
        </div>
        <div style={{ background: "#111", border: "1px solid #222", padding: "0.5rem 1rem", fontSize: "0.75rem", color: "#E84142", fontFamily: "monospace" }}>
          ● LIVE
        </div>
      </div>

      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #E84142, transparent)" }} />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {STATS.map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#111", border: "1px solid #222", padding: "1.5rem", borderRadius: "4px" }}>
            <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "#F5F5F5", marginBottom: "0.25rem" }}>{value}</p>
            <p style={{ color: "#555", fontSize: "0.75rem" }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

        {/* Recent Executions */}
        <div style={{ background: "#111", border: "1px solid #222", padding: "1.5rem", borderRadius: "4px" }}>
          <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Recent Executions</p>
          <div style={{ textAlign: "center", padding: "2rem 0", color: "#444" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>—</p>
            <p style={{ fontSize: "0.8rem" }}>No executions yet</p>
            <p style={{ fontSize: "0.75rem", color: "#333", marginTop: "0.25rem" }}>
              Executions happen automatically via keeper
            </p>
          </div>
        </div>

        <div style={{ background: "#111", border: "1px solid #222", padding: "1.5rem", borderRadius: "4px" }}>
          <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Your Vault</p>
          {hasVault ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#22c55e", fontSize: "0.75rem" }}>● Active</span>
              </div>
              <p style={{ color: "#555", fontSize: "0.72rem", wordBreak: "break-all", lineHeight: 1.6 }}>
                {vaultAddress as string}
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <a href={`https://testnet.snowtrace.io/address/${vaultAddress}`}
                  target="_blank" rel="noreferrer"
                  style={{ color: "#E84142", fontSize: "0.78rem", textDecoration: "none" }}>
                  View on Snowtrace →
                </a>
                <a href="/vaults"
                  style={{ color: "#888", fontSize: "0.78rem", textDecoration: "none" }}>
                  Manage →
                </a>
              </div>
              <div style={{ marginTop: "0.5rem", background: "#0A0A0A", border: "1px solid #1a1a1a", padding: "0.75rem", borderRadius: "2px" }}>
                <p style={{ color: "#555", fontSize: "0.7rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Network</p>
                <p style={{ color: "#F5F5F5", fontSize: "0.8rem" }}>Avalanche Fuji Testnet</p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "#444" }}>
              <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⬡</p>
              <p style={{ fontSize: "0.8rem" }}>No vault found</p>
              <a href="/vaults" style={{ color: "#E84142", fontSize: "0.75rem", textDecoration: "none", marginTop: "0.5rem", display: "block" }}>
                Create one →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Protocol Info */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[
          { name: "Trader Joe", role: "USDC → AVAX Swaps",   status: "Connected" },
          { name: "Benqi",      role: "AVAX Yield (qiAVAX)", status: "Connected" },
          { name: "Retro9000", role: "Gas Tracking Rewards", status: "Active"    },
        ].map(({ name, role, status }) => (
          <div key={name} style={{ background: "#111", border: "1px solid #222", padding: "1rem 1.5rem", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{name}</p>
              <p style={{ color: "#555", fontSize: "0.75rem" }}>{role}</p>
            </div>
            <span style={{ color: "#22c55e", fontSize: "0.7rem", letterSpacing: "0.1em" }}>● {status}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "#111", border: "1px solid #1a1a1a", padding: "1rem 1.5rem", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "#555", fontSize: "0.8rem" }}>Total vaults created on protocol</p>
        <p style={{ color: "#E84142", fontWeight: 700, fontSize: "1.2rem" }}>
          {(allVaults as string[])?.length ?? 0}
        </p>
      </div>
    </div>
  );
}
