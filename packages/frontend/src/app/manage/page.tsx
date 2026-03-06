"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useVault } from "@/hooks/useVault";
import { useVaultDetails } from "@/hooks/useVaultDetails";
import { FREQUENCY_OPTIONS } from "@/lib/constants";

export default function ManageVaultPage() {
  const { isConnected } = useAccount();
  const { vaultAddress } = useVault();
  const { status, pause, resume, updateSettings, isPending, isConfirming, isSuccess, refetch } = useVaultDetails(vaultAddress as string);

  const [editMode, setEditMode] = useState(false);
  const [newBuyAmount, setNewBuyAmount] = useState("");
  const [newFrequency, setNewFrequency] = useState(86400);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setEditMode(false);
    }
  }, [isSuccess, refetch]);

  const hasVault = vaultAddress && vaultAddress !== "0x0000000000000000000000000000000000000000";

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0", color: "#555" }}>
        <p style={{ fontSize: "1.2rem" }}>Connect wallet to manage your vault</p>
      </div>
    );
  }

  if (!hasVault) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0", color: "#555" }}>
        <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>No vault found</p>
        <a href="/vaults" style={{ color: "#E84142", fontSize: "0.9rem" }}>Create one →</a>
      </div>
    );
  }

  if (!status) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0", color: "#555" }}>
        <p>Loading vault details...</p>
      </div>
    );
  }

  const timeUntilNext = status.nextExecution - Math.floor(Date.now() / 1000);
  const hoursUntil = Math.max(0, Math.floor(timeUntilNext / 3600));
  const minutesUntil = Math.max(0, Math.floor((timeUntilNext % 3600) / 60));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      <div>
        <p style={{ color: "#888", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Vault Control Panel</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Manage Vault</h1>
      </div>

      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #E84142, transparent)" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {[
          { label: "Status", value: status.active ? "Active" : "Paused", color: status.active ? "#22c55e" : "#888" },
          { label: "Total Invested", value: `$${status.totalInvested.toFixed(2)}`, color: "#E84142" },
          { label: "Executions", value: status.executionCount.toString(), color: "#E84142" },
          { label: "Next Execution", value: status.canExecute ? "Ready Now" : `${hoursUntil}h ${minutesUntil}m`, color: status.canExecute ? "#22c55e" : "#888" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#111", border: "1px solid #222", padding: "1.5rem", borderRadius: "4px" }}>
            <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{label}</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

        <div style={{ background: "#111", border: "1px solid #222", padding: "2rem", borderRadius: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>DCA Settings</p>
            {!editMode && (
              <button onClick={() => setEditMode(true)} style={{ background: "transparent", border: "1px solid #E84142", color: "#E84142", padding: "0.4rem 0.8rem", fontSize: "0.7rem", cursor: "pointer", borderRadius: "2px" }}>
                Edit
              </button>
            )}
          </div>

          {editMode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ color: "#888", fontSize: "0.75rem", display: "block", marginBottom: "0.5rem" }}>Buy Amount (USDC)</label>
                <input type="number" value={newBuyAmount} onChange={e => setNewBuyAmount(e.target.value)} placeholder={status.buyAmount.toString()}
                  style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", color: "#F5F5F5", padding: "0.75rem", fontSize: "0.9rem", borderRadius: "2px" }} />
              </div>
              <div>
                <label style={{ color: "#888", fontSize: "0.75rem", display: "block", marginBottom: "0.5rem" }}>Frequency</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {FREQUENCY_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setNewFrequency(opt.value)}
                      style={{ padding: "0.6rem", background: newFrequency === opt.value ? "#E84142" : "#0A0A0A", border: `1px solid ${newFrequency === opt.value ? "#E84142" : "#333"}`, color: newFrequency === opt.value ? "#fff" : "#888", fontSize: "0.75rem", cursor: "pointer", borderRadius: "2px" }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => updateSettings(newBuyAmount || status.buyAmount.toString(), newFrequency)} disabled={isPending || isConfirming}
                  style={{ flex: 1, padding: "0.75rem", background: "#E84142", border: "none", color: "#fff", fontSize: "0.8rem", cursor: "pointer", borderRadius: "2px", opacity: isPending || isConfirming ? 0.5 : 1 }}>
                  {isPending ? "Confirm..." : isConfirming ? "Updating..." : "Save"}
                </button>
                <button onClick={() => setEditMode(false)} style={{ flex: 1, padding: "0.75rem", background: "#1a1a1a", border: "1px solid #333", color: "#888", fontSize: "0.8rem", cursor: "pointer", borderRadius: "2px" }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#0A0A0A", borderRadius: "2px" }}>
                <span style={{ color: "#555", fontSize: "0.8rem" }}>Buy Amount</span>
                <span style={{ color: "#F5F5F5", fontSize: "0.8rem" }}>${status.buyAmount} USDC</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "#0A0A0A", borderRadius: "2px" }}>
                <span style={{ color: "#555", fontSize: "0.8rem" }}>Frequency</span>
                <span style={{ color: "#F5F5F5", fontSize: "0.8rem" }}>{FREQUENCY_OPTIONS.find(o => o.value === status.frequency)?.label ?? `${status.frequency}s`}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: "#111", border: "1px solid #222", padding: "2rem", borderRadius: "4px" }}>
          <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Vault Controls</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {status.active ? (
              <button onClick={pause} disabled={isPending || isConfirming}
                style={{ padding: "1rem", background: "#1a1a1a", border: "1px solid #E84142", color: "#E84142", fontSize: "0.85rem", cursor: "pointer", borderRadius: "2px", opacity: isPending || isConfirming ? 0.5 : 1 }}>
                {isPending ? "Confirm in Wallet..." : isConfirming ? "Pausing..." : "⏸ Pause DCA"}
              </button>
            ) : (
              <button onClick={resume} disabled={isPending || isConfirming}
                style={{ padding: "1rem", background: "#E84142", border: "none", color: "#fff", fontSize: "0.85rem", cursor: "pointer", borderRadius: "2px", opacity: isPending || isConfirming ? 0.5 : 1 }}>
                {isPending ? "Confirm in Wallet..." : isConfirming ? "Resuming..." : "▶ Resume DCA"}
              </button>
            )}
            <a href={`https://testnet.snowtrace.io/address/${vaultAddress}`} target="_blank" rel="noreferrer"
              style={{ padding: "1rem", background: "#0A0A0A", border: "1px solid #333", color: "#888", fontSize: "0.85rem", textAlign: "center", textDecoration: "none", borderRadius: "2px" }}>
              View on Snowtrace →
            </a>
          </div>
        </div>
      </div>

      <div style={{ background: "#111", border: "1px solid #222", padding: "1.5rem", borderRadius: "4px" }}>
        <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Vault Contract</p>
        <p style={{ color: "#F5F5F5", fontSize: "0.85rem", fontFamily: "monospace", wordBreak: "break-all" }}>{vaultAddress as string}</p>
      </div>
    </div>
  );
}
