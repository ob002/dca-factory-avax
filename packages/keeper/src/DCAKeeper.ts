import { 
  Contract, 
  Signer, 
  ethers,
  BlockTag 
} from "ethers";
import { VaultMonitor } from "./VaultMonitor";
import { Executor } from "./Executor";

// Minimal ABI for DCAFactory
const DCA_FACTORY_ABI = [
  "function getAllVaults() view returns (address[] memory)",
  "function triggerDCA(address user) external",
  "function userVault(address) view returns (address)",
];

// Minimal ABI for DCAVault
const DCA_VAULT_ABI = [
  "function canExecute() external view returns (bool)",
  "function owner() external view returns (address)",
  "function getStatus() view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool, bool)",
];

export interface KeeperConfig {
  checkIntervalMs: number;
  gasLimitMultiplier: number;
  minAvaxBalance: number;
}

export interface VaultInfo {
  address: string;
  owner: string;
  canExecute: boolean;
  lastExecution: number;
  nextExecution: number;
  frequency: number;
}

/**
 * DCAKeeper - Main keeper orchestration class
 * Coordinates vault monitoring and execution
 */
export class DCAKeeper {
  private signer: Signer;
  private factoryContract: Contract;
  private vaultMonitor: VaultMonitor;
  private executor: Executor;
  private config: KeeperConfig;
  private isRunning: boolean = false;
  private checkCount: number = 0;
  private totalExecutions: number = 0;

  constructor(signer: Signer, factoryAddress: string, config: KeeperConfig) {
    this.signer = signer;
    this.config = config;
    
    // Initialize contracts
    this.factoryContract = new Contract(factoryAddress, DCA_FACTORY_ABI, signer);
    
    // Initialize components
    this.vaultMonitor = new VaultMonitor(signer, factoryAddress);
    this.executor = new Executor(signer, factoryAddress, config);
  }

  /**
   * Start the keeper monitoring loop
   */
  async start(): Promise<void> {
    this.isRunning = true;
    
    while (this.isRunning) {
      try {
        await this.runCheck();
        this.checkCount++;
        
        // Wait for next check interval
        await this.sleep(this.config.checkIntervalMs);
        
      } catch (error: any) {
        console.error(`❌ Error in check #${this.checkCount + 1}:`, error.message);
        // Wait before retrying
        await this.sleep(10000);
      }
    }
  }

  /**
   * Stop the keeper monitoring loop
   */
  stop(): void {
    this.isRunning = false;
    console.log("🛑 Keeper stopped");
  }

  /**
   * Run a single check cycle
   */
  private async runCheck(): Promise<void> {
    const startTime = Date.now();
    this.checkCount++;
    
    console.log(`\n🔍 Check #${this.checkCount} - ${new Date().toISOString()}`);
    console.log("─".repeat(50));

    // Get all vault addresses
    const vaultAddresses = await this.vaultMonitor.getAllVaults();
    console.log(`📦 Found ${vaultAddresses.length} total vaults`);

    if (vaultAddresses.length === 0) {
      console.log("💤 No vaults to check");
      return;
    }

    // Check which vaults can execute
    const readyVaults = await this.vaultMonitor.checkVaults(vaultAddresses);
    console.log(`⚡ ${readyVaults.length} vault(s) ready for execution`);

    if (readyVaults.length === 0) {
      // Show next execution times
      await this.vaultMonitor.showNextExecutions(vaultAddresses);
      return;
    }

    // Execute ready vaults
    for (const vault of readyVaults) {
      try {
        console.log(`\n🎯 Executing vault ${vault.address} (owner: ${vault.owner})`);
        
        const success = await this.executor.executeVault(vault);
        
        if (success) {
          this.totalExecutions++;
          console.log(`✅ Execution successful`);
        } else {
          console.log(`⚠️  Execution returned false`);
        }
        
      } catch (error: any) {
        console.error(`❌ Execution failed for ${vault.address}:`, error.message);
      }
      
      // Small delay between executions to avoid rate limits
      await this.sleep(2000);
    }

    // Summary
    const duration = Date.now() - startTime;
    console.log(`\n📊 Check Summary:`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Vaults checked: ${vaultAddresses.length}`);
    console.log(`   Vaults executed: ${readyVaults.length}`);
    console.log(`   Total executions (session): ${this.totalExecutions}`);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
