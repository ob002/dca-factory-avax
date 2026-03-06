import { Contract, Signer, ethers } from "ethers";

const DCA_FACTORY_ABI = [
  "function triggerDCA(address user) external",
  "function triggerBatchDCA(address[] calldata users) external",
  "function userVault(address) view returns (address)",
];

export interface KeeperConfig {
  gasLimitMultiplier: number;
  minAvaxBalance: number;
}

/**
 * Executor - Handles actual DCA execution transactions
 */
export class Executor {
  private signer: Signer;
  private factoryContract: Contract;
  private config: KeeperConfig;

  constructor(signer: Signer, factoryAddress: string, config: KeeperConfig) {
    this.signer = signer;
    this.config = config;
    this.factoryContract = new Contract(factoryAddress, DCA_FACTORY_ABI, signer);
  }

  /**
   * Execute a single vault via the factory
   */
  async executeVault(vault: { address: string; owner: string }): Promise<boolean> {
    try {
      // Estimate gas
      const gasEstimate = await this.estimateGas(vault.owner);
      const gasLimit = Math.floor(gasEstimate * this.config.gasLimitMultiplier);

      console.log(`   Gas estimate: ${gasEstimate}, using limit: ${gasLimit}`);

      // Send transaction
      const tx = await this.factoryContract.triggerDCA(vault.owner, {
        gasLimit,
      });

      console.log(`   📝 Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      console.log(`   ✅ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

      return true;
    } catch (error: any) {
      if (error.message.includes("Too soon to execute")) {
        console.log(`   ⏳ Vault not ready yet (race condition)`);
      } else if (error.message.includes("insufficient funds")) {
        console.error(`   ❌ Insufficient funds for gas`);
      } else {
        console.error(`   ❌ Transaction failed:`, error.message);
      }
      return false;
    }
  }

  /**
   * Execute multiple vaults in a batch
   */
  async executeBatch(vaultOwners: string[]): Promise<number> {
    if (vaultOwners.length === 0) return 0;

    try {
      console.log(`   📦 Batch executing ${vaultOwners.length} vaults`);

      // Estimate gas for batch
      const gasEstimate = await this.estimateBatchGas(vaultOwners);
      const gasLimit = Math.floor(gasEstimate * this.config.gasLimitMultiplier);

      console.log(`   Gas estimate: ${gasEstimate}, using limit: ${gasLimit}`);

      // Send batch transaction
      const tx = await this.factoryContract.triggerBatchDCA(vaultOwners, {
        gasLimit,
      });

      console.log(`   📝 Batch transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      console.log(`   ✅ Batch confirmed in block ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

      // Note: Some individual executions may have failed silently
      // The contract emits DCAFailed events for failures
      return vaultOwners.length;
    } catch (error: any) {
      console.error(`   ❌ Batch execution failed:`, error.message);
      return 0;
    }
  }

  /**
   * Estimate gas for single vault execution
   */
  private async estimateGas(vaultOwner: string): Promise<number> {
    try {
      const gas = await this.factoryContract.triggerDCA.estimateGas(vaultOwner);
      return Number(gas);
    } catch (error: any) {
      // If estimation fails, use default
      console.warn(`   ⚠️  Gas estimation failed, using default`);
      return 300000; // Default gas limit
    }
  }

  /**
   * Estimate gas for batch execution
   */
  private async estimateBatchGas(vaultOwners: string[]): Promise<number> {
    try {
      const gas = await this.factoryContract.triggerBatchDCA.estimateGas(vaultOwners);
      return Number(gas);
    } catch (error: any) {
      // Estimate ~250k gas per vault as fallback
      return vaultOwners.length * 250000;
    }
  }

  /**
   * Check if signer has sufficient balance
   */
  async checkBalance(): Promise<boolean> {
    try {
      const balance = await this.signer.provider!.getBalance(this.signer.address);
      const balanceInAvax = parseFloat(ethers.formatEther(balance));
      
      if (balanceInAvax < this.config.minAvaxBalance) {
        console.warn(`⚠️  Low balance: ${balanceInAvax.toFixed(4)} AVAX (min: ${this.config.minAvaxBalance})`);
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error("Failed to check balance:", error.message);
      return false;
    }
  }
}
