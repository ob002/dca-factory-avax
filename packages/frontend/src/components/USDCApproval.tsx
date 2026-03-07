"use client";
import { useUSDC } from "@/hooks/useUSDC";

interface USDCApprovalProps {
  requiredAmount?: string;
  onApproved?: () => void;
}

export function USDCApproval({ requiredAmount, onApproved }: USDCApprovalProps) {
  const { formattedBalance, formattedAllowance } = useUSDC();

  return (
    <div className="flex flex-col gap-2 p-3 border border-gray-800 rounded">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">USDC Balance</span>
        <span className="text-gray-100">{parseFloat(formattedBalance).toFixed(2)} USDC</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Allowance</span>
        <span className="text-gray-100">{parseFloat(formattedAllowance).toFixed(2)} USDC</span>
      </div>
    </div>
  );
}
