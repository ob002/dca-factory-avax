"use client";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "ethers";
import { TOKENS } from "@/lib/constants";

const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "allowance", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

export function useUSDC(spender?: string) {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract({
    address: TOKENS.USDC.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const { data: allowance } = useReadContract({
    address: TOKENS.USDC.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && spender ? [address, spender as `0x${string}`] : undefined,
    query: { enabled: isConnected && !!address && !!spender },
  });

  const rawBalance = balance ?? BigInt(0);
  const rawAllowance = allowance ?? BigInt(0);

  return {
    balance: rawBalance,
    allowance: rawAllowance,
    formattedBalance: formatUnits(rawBalance, 6),
    formattedAllowance: formatUnits(rawAllowance, 6),
  };
}
