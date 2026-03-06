import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Full DCA Flow — Integration", function () {
  let owner: any;
  let user1: any;
  let user2: any;

  // Mock tokens
  let mockUSDC: any;
  let mockWAVAX: any;

  // Mock protocols
  let mockTraderJoe: any;
  let mockMukebhi: any;

  // Our contracts
  let burnTracker: any;
  let executionEngine: any;
  let dcaFactory: any;

  // Test amounts
  const USDC_DECIMALS   = 6;
  const BUY_AMOUNT      = ethers.parseUnits("10", USDC_DECIMALS); // 10 USDC
  const FREQUENCY       = 86400;                                   // 1 day
  const INITIAL_BALANCE = ethers.parseUnits("1000", USDC_DECIMALS); // 1000 USDC

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // 1. Deploy mock tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");

    mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);
    await mockUSDC.waitForDeployment();

    mockWAVAX = await MockERC20.deploy("Wrapped AVAX", "WAVAX", 18);
    await mockWAVAX.waitForDeployment();

    // 2. Deploy mock protocols
    const MockTraderJoe = await ethers.getContractFactory("MockTraderJoe");
    mockTraderJoe = await MockTraderJoe.deploy(mockWAVAX.target);
    await mockTraderJoe.waitForDeployment();

    const MockBenqi = await ethers.getContractFactory("MockBenqi");
    mockMukebhi = await MockBenqi.deploy(mockWAVAX.target);
    await mockMukebhi.waitForDeployment();

    // 3. Fund mock protocols with WAVAX so swaps work
    await mockWAVAX.mint(mockTraderJoe.target, ethers.parseUnits("10000", 18));
    await mockWAVAX.mint(mockMukebhi.target,     ethers.parseUnits("10000", 18));

    // 4. Deploy our contracts
    const BurnTracker = await ethers.getContractFactory("BurnTracker");
    burnTracker = await BurnTracker.deploy();
    await burnTracker.waitForDeployment();

    const ExecutionEngine = await ethers.getContractFactory("ExecutionEngine");
    executionEngine = await ExecutionEngine.deploy(burnTracker.target);
    await executionEngine.waitForDeployment();

    const DCAFactory = await ethers.getContractFactory("DCAFactory");
    dcaFactory = await DCAFactory.deploy();
    await dcaFactory.waitForDeployment();

    // 5. Wire up dependencies
    await dcaFactory.setBurnTracker(burnTracker.target);
    await dcaFactory.setExecutionEngine(executionEngine.target);
    await executionEngine.setFactory(dcaFactory.target);

    // 6. Give user1 USDC and approve factory
    await mockUSDC.mint(user1.address, INITIAL_BALANCE);
    await mockUSDC.connect(user1).approve(
      executionEngine.target,
      ethers.MaxUint256 // max approval so engine can always pull
    );
  });

  describe("Contract Deployment & Wiring", function () {

    it("Should deploy all 7 contracts successfully", async function () {
      expect(mockUSDC.target).to.not.equal(ethers.ZeroAddress);
      expect(mockWAVAX.target).to.not.equal(ethers.ZeroAddress);
      expect(mockTraderJoe.target).to.not.equal(ethers.ZeroAddress);
      expect(mockMukebhi.target).to.not.equal(ethers.ZeroAddress);
      expect(burnTracker.target).to.not.equal(ethers.ZeroAddress);
      expect(executionEngine.target).to.not.equal(ethers.ZeroAddress);
      expect(dcaFactory.target).to.not.equal(ethers.ZeroAddress);
    });

    it("Should wire ExecutionEngine to DCAFactory correctly", async function () {
      expect(await executionEngine.factory()).to.equal(dcaFactory.target);
      expect(await executionEngine.factoryLocked()).to.equal(true);
      expect(await executionEngine.isReady()).to.equal(true);
    });

    it("Should wire DCAFactory dependencies correctly", async function () {
      expect(await dcaFactory.burnTracker()).to.equal(burnTracker.target);
      expect(await dcaFactory.executionEngine()).to.equal(executionEngine.target);
    });
  });

  describe("Vault Lifecycle", function () {

    it("Should create vault with correct settings", async function () {
      await dcaFactory.connect(user1).createVault(BUY_AMOUNT, FREQUENCY);

      const vaultAddr = await dcaFactory.connect(user1).getMyVault();
      const DCAVault  = await ethers.getContractFactory("DCAVault");
      const vault     = DCAVault.attach(vaultAddr) as any;

      expect(await vault.owner()).to.equal(user1.address);
      expect(await vault.buyAmount()).to.equal(BUY_AMOUNT);
      expect(await vault.frequency()).to.equal(FREQUENCY);
      expect(await vault.active()).to.equal(true);
      expect(await vault.executionCount()).to.equal(0);
    });

    it("Should not be executable immediately after creation", async function () {
      await dcaFactory.connect(user1).createVault(BUY_AMOUNT, FREQUENCY);
      const vaultAddr = await dcaFactory.connect(user1).getMyVault();

      const DCAVault = await ethers.getContractFactory("DCAVault");
      const vault    = DCAVault.attach(vaultAddr) as any;

      // Just created — lastExecution = now, so canExecute = false
      expect(await vault.canExecute()).to.equal(false);
    });

    it("Should be executable after frequency time passes", async function () {
      await dcaFactory.connect(user1).createVault(BUY_AMOUNT, FREQUENCY);
      const vaultAddr = await dcaFactory.connect(user1).getMyVault();

      const DCAVault = await ethers.getContractFactory("DCAVault");
      const vault    = DCAVault.attach(vaultAddr) as any;

      // Fast forward 1 day + 1 second
      await time.increase(FREQUENCY + 1);

      expect(await vault.canExecute()).to.equal(true);
    });

    it("Should allow owner to pause and resume vault", async function () {
      await dcaFactory.connect(user1).createVault(BUY_AMOUNT, FREQUENCY);
      const vaultAddr = await dcaFactory.connect(user1).getMyVault();

      const DCAVault = await ethers.getContractFactory("DCAVault");
      const vault    = DCAVault.attach(vaultAddr) as any;

      await vault.connect(user1).pause();
      expect(await vault.active()).to.equal(false);
      expect(await vault.canExecute()).to.equal(false);

      await vault.connect(user1).resume();
      expect(await vault.active()).to.equal(true);
    });

    it("Should prevent non-owner from pausing vault", async function () {
      await dcaFactory.connect(user1).createVault(BUY_AMOUNT, FREQUENCY);
      const vaultAddr = await dcaFactory.connect(user1).getMyVault();

      const DCAVault = await ethers.getContractFactory("DCAVault");
      const vault    = DCAVault.attach(vaultAddr) as any;

      await expect(
        vault.connect(user2).pause()
      ).to.be.revertedWith("Only owner");
    });
  });

  describe("Mock Protocol Behaviour", function () {

    it("MockTraderJoe should swap USDC for WAVAX", async function () {
      const swapAmount = ethers.parseUnits("10", 6);

      await mockUSDC.mint(owner.address, swapAmount);
      await mockUSDC.approve(mockTraderJoe.target, swapAmount);

      const wavaxBefore = await mockWAVAX.balanceOf(owner.address);

      const path = {
        pairBinSteps: [20],
        tokenPath:    [mockUSDC.target, mockWAVAX.target],
      };

      await mockTraderJoe.swapExactTokensForTokens(
        swapAmount, 0, path, owner.address,
        Math.floor(Date.now() / 1000) + 300
      );

      const wavaxAfter = await mockWAVAX.balanceOf(owner.address);
      expect(wavaxAfter).to.be.gt(wavaxBefore);
    });

    it("MockBenqi should mint qiAVAX and return 0 (success code)", async function () {
      const depositAmount = ethers.parseUnits("1", 18);

      await mockWAVAX.mint(owner.address, depositAmount);
      await mockWAVAX.approve(mockMukebhi.target, depositAmount);

      const qiBefore = await mockMukebhi.balanceOf(owner.address);
      const result   = await mockMukebhi.mint.staticCall(depositAmount);

      expect(result).to.equal(0); // must return 0 = success

      await mockMukebhi.mint(depositAmount);
      const qiAfter = await mockMukebhi.balanceOf(owner.address);
      expect(qiAfter).to.be.gt(qiBefore);
    });
  });

  describe("BurnTracker — Gas Recording", function () {

    it("Should accumulate gas across multiple executions", async function () {
      await burnTracker.recordUsage(user1.address, 200000, 1);
      await burnTracker.recordUsage(user1.address, 180000, 1);
      await burnTracker.recordUsage(user1.address, 210000, 1);

      const stats = await burnTracker.userStats(user1.address);
      expect(stats.totalGasUsed).to.equal(590000);
      expect(stats.totalTransactions).to.equal(3);
    });

    it("Should track multiple users independently", async function () {
      await burnTracker.recordUsage(user1.address, 200000, 2);
      await burnTracker.recordUsage(user2.address, 150000, 1);

      const stats1 = await burnTracker.userStats(user1.address);
      const stats2 = await burnTracker.userStats(user2.address);

      expect(stats1.totalGasUsed).to.equal(200000);
      expect(stats2.totalGasUsed).to.equal(150000);
      expect(stats1.totalTransactions).to.equal(2);
      expect(stats2.totalTransactions).to.equal(1);
    });
  });

  describe("Multi-User Scenarios", function () {

    it("Should support multiple users creating independent vaults", async function () {
      // Fund user2 as well
      await mockUSDC.mint(user2.address, INITIAL_BALANCE);

      await dcaFactory.connect(user1).createVault(BUY_AMOUNT, FREQUENCY);
      await dcaFactory.connect(user2).createVault(
        ethers.parseUnits("25", 6), // different amount
        FREQUENCY * 2               // different frequency
      );

      const vault1 = await dcaFactory.connect(user1).getMyVault();
      const vault2 = await dcaFactory.connect(user2).getMyVault();

      expect(vault1).to.not.equal(vault2);
      expect(vault1).to.not.equal(ethers.ZeroAddress);
      expect(vault2).to.not.equal(ethers.ZeroAddress);

      const allVaults = await dcaFactory.getAllVaults();
      expect(allVaults.length).to.equal(2);
    });

    it("Should correctly report vault status via getStatus()", async function () {
      await dcaFactory.connect(user1).createVault(BUY_AMOUNT, FREQUENCY);
      const vaultAddr = await dcaFactory.connect(user1).getMyVault();

      const DCAVault = await ethers.getContractFactory("DCAVault");
      const vault    = DCAVault.attach(vaultAddr) as any;

      const status = await vault.getStatus();

      expect(status._buyAmount).to.equal(BUY_AMOUNT);
      expect(status._frequency).to.equal(FREQUENCY);
      expect(status._totalInvested).to.equal(0);
      expect(status._executionCount).to.equal(0);
      expect(status._active).to.equal(true);
      expect(status._canExecute).to.equal(false); // just created
    });
  });
});