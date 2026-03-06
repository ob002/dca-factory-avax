"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/constants";
import DCAFactoryABI from "@/lib/abis/DCAFactory.json";

interface ManualTriggerProps {
  vaultAddress: string;
  canExecute: boolean;
  onSuccess?: () => void;
}

/**
 * ManualTrigger Component
 * Allows users to manually trigger DCA execution for demo/testing
 * Shows button only when vault can execute
 */
export function ManualTrigger({ vaultAddress, canExecute, onSuccess }: ManualTriggerProps) {
  const { isConnected } = useAccount();
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    writeContract: triggerDCA,
    data: txHash,
    isPending: isPending,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: txHash,
  });

  // Handle successful execution
  if (isSuccess) {
    setTimeout(() => {
      onSuccess?.();
      setShowConfirm(false);
    }, 1000);
  }

  const handleTrigger = () => {
    if (!vaultAddress || vaultAddress === "0x0000000000000000000000000000000000000000") return;
    
    // Extract owner address from vault (we need to call the factory with user address)
    // For now, we'll use the vault address directly
    triggerDCA({
      address: CONTRACTS.DCA_FACTORY as `0x${string}`,
      abi: DCAFactoryABI,
      functionName: "triggerDCA",
      args: [vaultAddress as `0x${string}`],
    });
  };

  const isDisabled = !isConnected || !canExecute || isPending || isConfirming;

  return (
    <div style={{ 
      background: "#111", 
      border: "1px solid #222", 
      padding: "1.5rem", 
      borderRadius: "4px",
      marginTop: "1rem"
    }}>
      <p style={{ 
        color: "#888", 
        fontSize: "0.7rem", 
        letterSpacing: "0.15em", 
        textTransform: "uppercase", 
        marginBottom: "1rem" 
      }}>
        Manual Execution
      </p>

      {canExecute ? (
        <>
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
            <span style={{ color: "#22c55e", fontSize: "0.9rem" }}>⚡</span>
            <span style={{ color: "#22c55e", fontSize: "0.8rem" }}>
              Ready to execute
            </span>
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isDisabled}
              style={{
                width: "100%",
                padding: "1rem",
                background: isDisabled ? "#1a1a1a" : "#22c55e",
                border: "none",
                color: isDisabled ? "#555" : "#000",
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.85rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: isDisabled ? "not-allowed" : "pointer",
                borderRadius: "2px",
                fontWeight: 600,
              }}
            >
              Execute DCA Now
            </button>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleTrigger}
                disabled={isPending || isConfirming}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: isPending || isConfirming ? "#1a1a1a" : "#22c55e",
                  border: "none",
                  color: isPending || isConfirming ? "#555" : "#000",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.85rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: isPending || isConfirming ? "not-allowed" : "pointer",
                  borderRadius: "2px",
                  fontWeight: 600,
                  opacity: isPending || isConfirming ? 0.7 : 1,
                }}
              >
                {isPending ? "Confirm..." : isConfirming ? "Executing..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending || isConfirming}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  color: "#888",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.85rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: isPending || isConfirming ? "not-allowed" : "pointer",
                  borderRadius: "2px",
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {error && (
            <p style={{ 
              color: "#E84142", 
              fontSize: "0.75rem", 
              marginTop: "0.75rem",
              fontFamily: "monospace"
            }}>
              {error.message}
            </p>
          )}

          <p style={{ 
            color: "#444", 
            fontSize: "0.7rem", 
            marginTop: "1rem",
            lineHeight: 1.6
          }}>
            ⚠️ This will execute your DCA immediately. Make sure your vault has sufficient USDC balance.
          </p>
        </>
      ) : (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          padding: "1rem", 
          background: "#0A0A0A", 
          border: "1px solid #1a1a1a", 
          borderRadius: "2px",
          textAlign: "center"
        }}>
          <span style={{ color: "#555", fontSize: "1.2rem" }}>⏳</span>
          <div style={{ textAlign: "left" }}>
            <p style={{ color: "#555", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
              Not ready yet
            </p>
            <p style={{ color: "#444", fontSize: "0.7rem" }}>
              Wait for the frequency period to complete
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
