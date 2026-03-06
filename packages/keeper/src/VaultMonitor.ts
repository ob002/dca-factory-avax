import { Contract, Signer } from "ethers";

const DCA_VAULT_ABI = [
  "function canExecute() external view returns (bool)",
  "function owner() external view returns (address)",
  "function getStatus() view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool, bool)",
];

const DCA_FACTORY_ABI = [
  "function getAllVaults() view returns (address[] memory)",
  "function userVault(address) view returns (address)",
];

export interface VaultStatus {
  address: string;
  owner: string;
  canExecute: boolean;
  lastExecution: number;
  nextExecution: number;
  frequency: number;
  active: boolean;
}

/**
 * VaultMonitor - Handles vault state checking
 * Fetches all vaults and determines which are ready for execution
 */
export class VaultMonitor {
  private signer: Signer;
  private factoryContract: Contract;

  constructor(signer: Signer, factoryAddress: string) {
    this.signer = signer;
    this.factoryContract = new Contract(factoryAddress, DCA_FACTORY_ABI, signer);
  }

  /**
   * Get all vault addresses from the factory
   */
  async getAllVaults(): Promise<string[]> {
    try {
      const vaults = await this.factoryContract.getAllVaults();
      return vaults.map((v: string) => v);
    } catch (error: any) {
      console.error("Failed to get all vaults:", error.message);
      return [];
    }
  }

  /**
   * Check multiple vaults and return those ready for execution
   */
  async checkVaults(vaultAddresses: string[]): Promise<VaultStatus[]> {
    const readyVaults: VaultStatus[] = [];

    for (const address of vaultAddresses) {
      try {
        const status = await this.getVaultStatus(address);
        if (status && status.canExecute && status.active) {
          readyVaults.push(status);
        }
      } catch (error: any) {
        console.error(`Failed to check vault ${address}:`, error.message);
      }
    }

    return readyVaults;
  }

  /**
   * Get detailed status for a single vault
   */
  async getVaultStatus(vaultAddress: string): Promise<VaultStatus | null> {
    try {
      const vaultContract = new Contract(vaultAddress, DCA_VAULT_ABI, this.signer);
      
      // Get status tuple: [buyAmount, frequency, lastExecution, nextExecution, totalInvested, executionCount, active, canExecute]
      const status = await vaultContract.getStatus();
      const owner = await vaultContract.owner();

      return {
        address: vaultAddress,
        owner: owner as string,
        canExecute: status[7] as boolean,
        lastExecution: Number(status[2]),
        nextExecution: Number(status[3]),
        frequency: Number(status[1]),
        active: status[6] as boolean,
      };
    } catch (error: any) {
      console.error(`Failed to get status for vault ${vaultAddress}:`, error.message);
      return null;
    }
  }

  /**
   * Check if a single vault can execute
   */
  async canExecute(vaultAddress: string): Promise<boolean> {
    try {
      const vaultContract = new Contract(vaultAddress, DCA_VAULT_ABI, this.signer);
      return await vaultContract.canExecute();
    } catch (error: any) {
      console.error(`Failed to check canExecute for ${vaultAddress}:`, error.message);
      return false;
    }
  }

  /**
   * Display next execution times for all vaults
   */
  async showNextExecutions(vaultAddresses: string[]): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    
    console.log("\n📅 Next Execution Times:");
    
    for (const address of vaultAddresses) {
      try {
        const status = await this.getVaultStatus(address);
        if (!status) continue;

        const timeUntil = status.nextExecution - now;
        const minutesUntil = Math.max(0, Math.floor(timeUntil / 60));
        const hoursUntil = Math.floor(minutesUntil / 60);
        
        const statusIcon = status.canExecute && status.active ? "⚡" : status.active ? "⏳" : "⏸️";
        
        console.log(
          `   ${statusIcon} ${address.slice(0, 10)}...${address.slice(-8)} | ` +
          `Owner: ${status.owner.slice(0, 10)}... | ` +
          `Next: ${hoursUntil}h ${minutesUntil % 60}m | ` +
          `Freq: ${status.frequency / 3600}h`
        );
      } catch (error: any) {
        console.log(`   ❌ ${address.slice(0, 10)}...${address.slice(-8)} | Error reading status`);
      }
    }
  }
}
