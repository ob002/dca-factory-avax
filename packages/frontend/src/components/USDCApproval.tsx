"use client";

import { useState, useEffect } from "react";
import { useUSDC } from "@/hooks/useUSDC";

interface USDCApprovalProps {
  requiredAmount: string;
  onApproved: () => void;
}

/**
 * USDCApproval Component
 * Displays USDC balance, current allowance, and approval buttons
 * Used in vault creation flow
 */
export function USDCApproval({ requiredAmount, onApproved }: USDCApprovalProps) {
  const {
    formattedBalance,
    formattedAllowance,
    allowanceLoading,
    approve,
    approveMax,
    isApproving,
    isConfirmingApproval,
    isApproved,
    hasApprovedEnough,
    refetchAllowance,
  } = useUSDC();

  const [mode, setMode] = useState<"amount" | "infinite">("infinite");
  
  const approvedEnough = hasApprovedEnough(requiredAmount);

  // Auto-refetch allowance after approval
  useEffect(() => {
    if (isApproved) {
      const timer = setTimeout(() => {
        refetchAllowance();
        onApproved();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isApproved, refetchAllowance, onApproved]);

  const isPending = isApproving || isConfirmingApproval;

  return (
    <div style={{ 
      background: "#0A0A0A", 
      border: "1px solid #1a1a1a", 
      padding: "1.25rem", 
      borderRadius: "4px",
      marginBottom: "1rem"
    }}>
      <p style={{ 
        color: "#555", 
        fontSize: "0.7rem", 
        textTransform: "uppercase", 
        letterSpacing: "0.1em", 
        marginBottom: "1rem" 
      }}>
        USDC Approval
      </p>

      {/* Balance & Allowance Display */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "0.75rem", 
        marginBottom: "1.25rem" 
      }}>
        <div>
          <p style={{ color: "#444", fontSize: "0.7rem", marginBottom: "0.25rem" }}>Your Balance</p>
          <p style={{ color: "#F5F5F5", fontSize: "1.1rem", fontFamily: "monospace" }}>
            {allowanceLoading ? "..." : formattedBalance.toFixed(2)} USDC
          </p>
        </div>
        <div>
          <p style={{ color: "#444", fontSize: "0.7rem", marginBottom: "0.25rem" }}>Approved Allowance</p>
          <p style={{ 
            color: approvedEnough ? "#22c55e" : "#E84142", 
            fontSize: "1.1rem", 
            fontFamily: "monospace" 
          }}>
            {allowanceLoading ? "..." : formattedAllowance.toFixed(2)} USDC
          </p>
        </div>
      </div>

      {/* Status Message */}
      {approvedEnough ? (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          padding: "0.75rem", 
          background: "rgba(34, 197, 94, 0.1)", 
          border: "1px solid rgba(34, 197, 94, 0.2)", 
          borderRadius: "2px",
          marginBottom: "1rem"
        }}>
          <span style={{ color: "#22c55e", fontSize: "0.9rem" }}>✓</span>
          <span style={{ color: "#22c55e", fontSize: "0.8rem" }}>
            Approved ${requiredAmount} for DCA Factory
          </span>
        </div>
      ) : (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          padding: "0.75rem", 
          background: "rgba(232, 65, 66, 0.1)", 
          border: "1px solid rgba(232, 65, 66, 0.2)", 
          borderRadius: "2px",
          marginBottom: "1rem"
        }}>
          <span style={{ color: "#E84142", fontSize: "0.9rem" }}>⚠️</span>
          <span style={{ color: "#E84142", fontSize: "0.8rem" }}>
            Approval required: ${requiredAmount} USDC
          </span>
        </div>
      )}

      {/* Approval Mode Toggle */}
      <div style={{ 
        display: "flex", 
        gap: "0.5rem", 
        marginBottom: "1rem" 
      }}>
        <button
          onClick={() => setMode("infinite")}
          style={{
            flex: 1,
            padding: "0.5rem",
            background: mode === "infinite" ? "#1a1a1a" : "transparent",
            border: `1px solid ${mode === "infinite" ? "#E84142" : "#333"}`,
            color: mode === "infinite" ? "#E84142" : "#555",
            fontSize: "0.75rem",
            cursor: "pointer",
            borderRadius: "2px",
            transition: "all 0.15s",
          }}
        >
          Infinite (Recommended)
        </button>
        <button
          onClick={() => setMode("amount")}
          style={{
            flex: 1,
            padding: "0.5rem",
            background: mode === "amount" ? "#1a1a1a" : "transparent",
            border: `1px solid ${mode === "amount" ? "#E84142" : "#333"}`,
            color: mode === "amount" ? "#E84142" : "#555",
            fontSize: "0.75rem",
            cursor: "pointer",
            borderRadius: "2px",
            transition: "all 0.15s",
          }}
        >
          Exact Amount
        </button>
      </div>

      {/* Approval Button */}
      <button
        onClick={() => mode === "infinite" ? approveMax() : approve(requiredAmount)}
        disabled={isPending || approvedEnough}
        style={{
          width: "100%",
          padding: "0.9rem",
          background: isPending || approvedEnough ? "#1a1a1a" : "#E84142",
          border: "none",
          color: isPending || approvedEnough ? "#555" : "#fff",
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: "0.85rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: isPending || approvedEnough ? "not-allowed" : "pointer",
          borderRadius: "2px",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isApproving ? "Confirm in Wallet..." : 
         isConfirmingApproval ? "Approving..." : 
         approvedEnough ? "Approved ✓" : 
         mode === "infinite" ? "Approve Unlimited" : `Approve $${requiredAmount}`}
      </button>

      {/* Info Text */}
      <p style={{ 
        color: "#444", 
        fontSize: "0.7rem", 
        marginTop: "0.75rem", 
        textAlign: "center" 
      }}>
        {mode === "infinite" 
          ? "One-time approval for all future DCA executions" 
          : "Approve exact amount for single execution"}
      </p>
    </div>
  );
}
