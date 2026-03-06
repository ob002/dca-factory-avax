"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { FREQUENCY_OPTIONS } from "@/lib/constants";
import { useVault } from "@/hooks/useVault";

export default function VaultsPage() {
  const { isConnected } = useAccount();
  const [buyAmount, setBuyAmount] = useState("");
  const [frequency, setFrequency] = useState(86400);

  const {
    vaultAddress,
    allVaults,
    createVault,
    isCreating,
    isConfirming,
    isCreated,
    createError,
    refetchVault,
    refetchAllVaults,
  } = useVault();

  const hasVault = vaultAddress &&
    vaultAddress !== "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    if (isCreated) {
      refetchVault();
      refetchAllVaults();
    }
  }, [isCreated]);

  const buttonLabel = () => {
    if (!isConnected)  return "Connect Wallet First";
    if (isCreating)    return "Confirm in Wallet...";
    if (isConfirming)  return "Confirming on Chain...";
    if (isCreated)     return "Vault Created! ✓";
    return "Create Vault →";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      <div>
        <p style={{ color: "#888", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Vault Management</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>DCA Vaults</h1>
      </div>

      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #E84142, transparent)" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>

        {/* Left — create or show existing */}
        <div style={{ background: "#111", border: "1px solid #222", padding: "2rem", borderRadius: "4px" }}>

      {hasVault ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Your Active Vault</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#22c55e", fontSize: "0.85rem" }}>● Active</span>
              </div>
              <p style={{ color: "#555", fontSize: "0.75rem", wordBreak: "break-all", lineHeight: 1.7, fontFamily: "monospace" }}>
                {vaultAddress as string}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <a href={`https://testnet.snowtrace.io/address/${vaultAddress}`}
                  target="_blank" rel="noreferrer"
                  style={{ color: "#E84142", fontSize: "0.85rem", textDecoration: "none" }}>
                  View on Snowtrace →
                </a>
              </div>
              <div style={{ background: "#0A0A0A", border: "1px solid #1a1a1a", padding: "1rem", borderRadius: "2px", marginTop: "0.5rem" }}>
                <p style={{ color: "#555", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Vault Info</p>
                {[
                  ["Network",  "Avalanche Fuji Testnet"],
                  ["Status",   "Active — awaiting execution"],
                  ["Yield",    "Benqi qiAVAX"],
                  ["Tracking", "Retro9000 gas tracker"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ color: "#444", fontSize: "0.75rem" }}>{k}</span>
                    <span style={{ color: "#F5F5F5", fontSize: "0.75rem" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Create New Vault</p>

              <div>
                <label style={{ color: "#888", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                  Buy Amount (USDC)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={e => setBuyAmount(e.target.value)}
                    placeholder="10.00"
                    style={{
                      width: "100%", background: "#0A0A0A", border: "1px solid #333",
                      color: "#F5F5F5", padding: "0.75rem 3rem 0.75rem 1rem",
                      fontFamily: "IBM Plex Mono, monospace", fontSize: "1rem",
                      outline: "none", borderRadius: "2px", boxSizing: "border-box",
                    }}
                  />
                  <span style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: "0.8rem" }}>USDC</span>
                </div>
                <p style={{ color: "#444", fontSize: "0.7rem", marginTop: "0.35rem" }}>Minimum 1 USDC per execution</p>
              </div>

              <div>
                <label style={{ color: "#888", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                  DCA Frequency
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {FREQUENCY_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setFrequency(opt.value)} style={{
                      padding: "0.6rem",
                      background: frequency === opt.value ? "#E84142" : "#0A0A0A",
                      border: `1px solid ${frequency === opt.value ? "#E84142" : "#333"}`,
                      color: frequency === opt.value ? "#fff" : "#888",
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: "0.75rem", cursor: "pointer", borderRadius: "2px", transition: "all 0.15s",
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {buyAmount && Number(buyAmount) > 0 && (
                <div style={{ background: "#0A0A0A", border: "1px solid #1a1a1a", padding: "1rem", borderRadius: "2px" }}>
                  <p style={{ color: "#555", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Summary</p>
                  {[
                    ["Buy",       `$${buyAmount} USDC → AVAX`],
                    ["Frequency", FREQUENCY_OPTIONS.find(o => o.value === frequency)?.label ?? ""],
                    ["Yield",     "Deposited to Benqi (qiAVAX)"],
                    ["Gas",       "Tracked for Retro9000"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span style={{ color: "#555", fontSize: "0.75rem" }}>{k}</span>
                      <span style={{ color: "#F5F5F5", fontSize: "0.75rem" }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => createVault(buyAmount, frequency)}
                disabled={!isConnected || isCreating || isConfirming || !buyAmount}
                style={{
                  padding: "0.9rem",
                  background: !isConnected || !buyAmount ? "#1a1a1a" : "#E84142",
                  border: "none", color: "#fff",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: !isConnected || !buyAmount ? "not-allowed" : "pointer",
                  borderRadius: "2px", opacity: isCreating || isConfirming ? 0.7 : 1,
                }}
              >
                {buttonLabel()}
              </button>
            </div>
          )}
        </div>

        {/* Right — all vaults list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            All Vaults ({(allVaults as any[])?.length ?? 0})
          </p>
          {((allVaults as any[]) ?? []).length === 0 ? (
            <div style={{ background: "#111", border: "1px solid #222", padding: "2rem", borderRadius: "4px", textAlign: "center" }}>
              <p style={{ color: "#333", fontSize: "0.85rem" }}>No vaults yet</p>
            </div>
          ) : (
            ((allVaults as any[]) ?? []).map((addr: string, i: number) => (
              <div key={addr} style={{ background: "#111", border: "1px solid #222", padding: "1rem 1.5rem", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ color: "#888", fontSize: "0.7rem", marginBottom: "0.25rem" }}>Vault #{i + 1}</p>
                  <p style={{ fontSize: "0.78rem", color: "#F5F5F5", wordBreak: "break-all", fontFamily: "monospace" }}>{addr}</p>
                </div>
                <a href={`https://testnet.snowtrace.io/address/${addr}`} target="_blank" rel="noreferrer"
                  style={{ color: "#E84142", fontSize: "0.75rem", textDecoration: "none", marginLeft: "1rem", whiteSpace: "nowrap" }}>
                  View →
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
