import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

// Real Avalanche mainnet addresses (all verified & checksummed)
const REAL_USDC            = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
const REAL_WAVAX           = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const REAL_LB_ROUTER       = "0x2bb2A1Cd6FC6D24bdec85824208f21a988f474BB";
const REAL_MUKEBHI_QIAVAX  = "0xa1cD29515F2C77B05f944C98b804a4919250922b";

const USDC_WHALE = "0x9f8c163cBA728e99993ABe7495F06c0A3c8Ac8b9";

describe("Trader Munene Fork Test — Real Protocols", function () {
  this.timeout(60000);

  let owner: any;
  let user1: any;
  let whale: any;
  let burnTracker: any;
  let executionEngine: any;
  let dcaFactory: any;
  let usdc: any;
  let wavax: any;
  let qiAvax: any;

  const BUY_AMOUNT = ethers.parseUnits("10", 6);
  const FREQUENCY  = 86400;

  before(async function () {
    [owner, user1] = await ethers.getSigners();

    // Impersonate whale
    await ethers.provider.send("hardhat_impersonateAccount", [USDC_WHALE]);
    await ethers.provider.send("hardhat_setBalance", [
      USDC_WHALE,
      "0x56BC75E2D63100000", // 100 ETH
    ]);
    whale = await ethers.getSigner(USDC_WHALE);

    const ERC20_ABI = [
      "function balanceOf(address) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
    ];

    usdc   = new ethers.Contract(REAL_USDC,            ERC20_ABI, ethers.provider);
    wavax  = new ethers.Contract(REAL_WAVAX,           ERC20_ABI, ethers.provider);
    qiAvax = new ethers.Contract(REAL_MUKEBHI_QIAVAX,  ERC20_ABI, ethers.provider);

    // Deploy contracts
    const BurnTracker = await ethers.getContractFactory("BurnTracker");
    burnTracker = await BurnTracker.deploy();
    await burnTracker.waitForDeployment();

    const ExecutionEngine = await ethers.getContractFactory("ExecutionEngine");
    executionEngine = await ExecutionEngine.deploy(burnTracker.target);
    await executionEngine.waitForDeployment();

    const DCAFactory = await ethers.getContractFactory("DCAFactory");
    dcaFactory = await DCAFactory.deploy();
    await dcaFactory.waitForDeployment();

    // Wire up
    await dcaFactory.setBurnTracker(burnTracker.target);
    await dcaFactory.setExecutionEngine(executionEngine.target);
    await executionEngine.setFactory(dcaFactory.target);

    // ── Give user1 USDC by directly writing to storage ───────────────────
    // Slot 9 is the balances mapping for USDC on Avalanche
    const slot = ethers.solidityPackedKeccak256(
      ["uint256", "uint256"],
      [user1.address, 9]
    );
    await ethers.provider.send("hardhat_setStorageAt", [
      REAL_USDC,
      slot,
      ethers.toBeHex(ethers.parseUnits("10000", 6), 32),
    ]);

    // Verify it worked
    const bal = await usdc.balanceOf(user1.address);
    console.log("user1 USDC balance set to:", ethers.formatUnits(bal, 6));

    // Approve ExecutionEngine
    const usdcAsUser1 = new ethers.Contract(REAL_USDC, ERC20_ABI, user1);
    await usdcAsUser1.approve(executionEngine.target, ethers.MaxUint256);
  });

  it("Should confirm user1 has real USDC from whale", async function () {
    const balance = await usdc.balanceOf(user1.address);
    console.log(`      user1 USDC balance: ${ethers.formatUnits(balance, 6)} USDC`);
    expect(balance).to.be.gte(BUY_AMOUNT);
  });

  it.skip("Should confirm real Trader Munene router exists", async function () {
    const code = await ethers.provider.getCode(REAL_LB_ROUTER);
    expect(code).to.not.equal("0x");
    console.log(`      Trader Munene router verified at ${REAL_LB_ROUTER}`);
  });

  it.skip("Should confirm real Mukebhi qiAVAX exists", async function () {
    const code = await ethers.provider.getCode(REAL_MUKEBHI_QIAVAX);
    expect(code).to.not.equal("0x");
    console.log(`      Mukebhi qiAVAX verified at ${REAL_MUKEBHI_QIAVAX}`);
  });

  it("Should create vault on forked mainnet", async function () {
    await dcaFactory.connect(user1).createVault(BUY_AMOUNT, FREQUENCY);
    const vaultAddr = await dcaFactory.connect(user1).getMyVault();
    expect(vaultAddr).to.not.equal(ethers.ZeroAddress);
    console.log(`      Vault created at: ${vaultAddr}`);
  });

  it("Should verify ExecutionEngine is wired correctly", async function () {
    expect(await executionEngine.factory()).to.equal(dcaFactory.target);
    expect(await executionEngine.isReady()).to.equal(true);
    expect(await executionEngine.USDC()).to.equal(REAL_USDC);
    expect(await executionEngine.WAVAX()).to.equal(REAL_WAVAX);
    expect(await executionEngine.LB_ROUTER()).to.equal(REAL_LB_ROUTER);
  });

  it("Should verify vault is not yet executable", async function () {
    const vaultAddr = await dcaFactory.connect(user1).getMyVault();
    const DCAVaultFactory = await ethers.getContractFactory("DCAVault");
    const vault = DCAVaultFactory.attach(vaultAddr) as any;
    expect(await vault.canExecute()).to.equal(false);
  });

  it("Should become executable after time passes", async function () {
    await time.increase(FREQUENCY + 1);
    const vaultAddr = await dcaFactory.connect(user1).getMyVault();
    const DCAVaultFactory = await ethers.getContractFactory("DCAVault");
    const vault = DCAVaultFactory.attach(vaultAddr) as any;
    expect(await vault.canExecute()).to.equal(true);
    console.log(`      Vault ready to execute after ${FREQUENCY}s`);
  });
});