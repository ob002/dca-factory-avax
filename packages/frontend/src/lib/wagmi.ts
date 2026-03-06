import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "DCA Factory",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "YOUR_PROJECT_ID",
  chains: [avalancheFuji],
  ssr: true,
});