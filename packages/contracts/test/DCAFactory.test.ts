import { expect } from "chai";
import { ethers } from "hardhat";

//  DCA FACTORY — Individual Unit Tests
describe("DCA Factory", function () {
  let dcaFactory: any;
  let burnTracker: any;
  let executionEngine: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // 1. Deploy BurnTracker
    const BurnTrackerFactory = await ethers.getContractFactory("BurnTracker");
    burnTracker = await BurnTrackerFactory.deploy();
    await burnTracker.waitForDeployment();

    // 2. Deploy ExecutionEngine
    const ExecutionEngineFactory = await ethers.getContractFactory("ExecutionEngine");
    executionEngine = await ExecutionEngineFactory.deploy(burnTracker.target);
    await executionEngine.waitForDeployment();

    // 3. Deploy DCAFactory
    const DCAFactoryContract = await ethers.getContractFactory("DCAFactory");
    dcaFactory = await DCAFactoryContract.deploy();
    await dcaFactory.waitForDeployment();

    // 4. Wire up — matches deployment script order exactly
    await dcaFactory.setBurnTracker(burnTracker.target);
    await dcaFactory.setExecutionEngine(executionEngine.target);
    // Point ExecutionEngine at DCAFactory (setFactory is one-time only)
    await executionEngine.setFactory(dcaFactory.target);
  });

  // Deployment
  describe("Deployment", function () {
    it("Should deploy with empty vault list", async function () {
      const allVaults = await dcaFactory.getAllVaults();
      expect(allVaults.length).to.equal(0);
    });

    it("Should set owner to deployer", async function () {
      expect(await dcaFactory.owner()).to.equal(owner.address);
    });

    it("Should wire BurnTracker and ExecutionEngine correctly", async function () {
      expect(await dcaFactory.burnTracker()).to.equal(burnTracker.target);
      expect(await dcaFactory.executionEngine()).to.equal(executionEngine.target);
    });

    it("Should lock ExecutionEngine factory after setFactory", async function () {
      expect(await executionEngine.factoryLocked()).to.equal(true);
      expect(await executionEngine.isReady()).to.equal(true);
    });
  });

  // Vault Creation
  describe("Vault Creation", function () {
    it("Should create a new vault", async function () {
      const buyAmount = ethers.parseUnits("10", 6);
      const frequency = 86400;

      await dcaFactory.createVault(buyAmount, frequency);

      const userVault = await dcaFactory.getMyVault();
      expect(userVault).to.not.equal(ethers.ZeroAddress);
    });

    it("Should store vault address for user", async function () {
      const buyAmount = ethers.parseUnits("10", 6);
      const frequency = 86400;

      await dcaFactory.connect(addr1).createVault(buyAmount, frequency);

      const vaultAddress = await dcaFactory.connect(addr1).getMyVault();
      expect(vaultAddress).to.be.properAddress;
    });

    it("Should prevent duplicate vaults", async function () {
      const buyAmount = ethers.parseUnits("10", 6);
      const frequency = 86400;

      await dcaFactory.createVault(buyAmount, frequency);

      await expect(
        dcaFactory.createVault(buyAmount, frequency)
      ).to.be.revertedWith("Vault already exists");
    });

    it("Should add vault to allVaults list", async function () {
      const buyAmount = ethers.parseUnits("10", 6);
      const frequency = 86400;

      await dcaFactory.connect(addr1).createVault(buyAmount, frequency);
      await dcaFactory.connect(addr2).createVault(buyAmount, frequency);

      const allVaults = await dcaFactory.getAllVaults();
      expect(allVaults.length).to.equal(2);
    });

    it("Should reject zero buy amount", async function () {
      await expect(
        dcaFactory.createVault(0, 86400)
      ).to.be.revertedWith("Buy amount is zero");
    });

    it("Should reject zero frequency", async function () {
      await expect(
        dcaFactory.createVault(ethers.parseUnits("10", 6), 0)
      ).to.be.revertedWith("Frequency is zero");
    });
  });

  // Vault Initialization
  describe("Vault Initialization", function () {
    it("Should initialize vault with correct parameters", async function () {
      const buyAmount = ethers.parseUnits("25", 6);
      const frequency = 43200;

      await dcaFactory.createVault(buyAmount, frequency);
      const vaultAddress = await dcaFactory.getMyVault();

      const DCAVaultContract = await ethers.getContractFactory("DCAVault");
      const vault = DCAVaultContract.attach(vaultAddress) as any;

      expect(await vault.buyAmount()).to.equal(buyAmount);
      expect(await vault.frequency()).to.equal(frequency);
    });

    it("Should set vault owner to the user who created it", async function () {
      await dcaFactory.connect(addr1).createVault(ethers.parseUnits("10", 6), 86400);
      const vaultAddress = await dcaFactory.connect(addr1).getMyVault();

      const DCAVaultContract = await ethers.getContractFactory("DCAVault");
      const vault = DCAVaultContract.attach(vaultAddress) as any;

      expect(await vault.owner()).to.equal(addr1.address);
    });

    it("Should start vault as active", async function () {
      await dcaFactory.createVault(ethers.parseUnits("10", 6), 86400);
      const vaultAddress = await dcaFactory.getMyVault();

      const DCAVaultContract = await ethers.getContractFactory("DCAVault");
      const vault = DCAVaultContract.attach(vaultAddress) as any;

      expect(await vault.active()).to.equal(true);
    });
  });

  // Access Control
  describe("Access Control", function () {
    it("Should prevent non-owner from setting ExecutionEngine twice", async function () {
      await expect(
        dcaFactory.connect(addr1).setExecutionEngine(ethers.ZeroAddress)
      ).to.be.revertedWith("Not owner");
    });

    it("Should prevent setting ExecutionEngine twice", async function () {
      await expect(
        dcaFactory.setExecutionEngine(executionEngine.target)
      ).to.be.revertedWith("Already set");
    });

    it("Should prevent setting BurnTracker twice", async function () {
      await expect(
        dcaFactory.setBurnTracker(burnTracker.target)
      ).to.be.revertedWith("Already set");
    });

    it("Should prevent setFactory on ExecutionEngine being called twice", async function () {
      await expect(
        executionEngine.setFactory(dcaFactory.target)
      ).to.be.revertedWith("Not authorized");
    });
  });
});

//  BURN TRACKER — Unit Tests
describe("Burn Tracker", function () {
  let burnTracker: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const BurnTrackerFactory = await ethers.getContractFactory("BurnTracker");
    burnTracker = await BurnTrackerFactory.deploy();
    await burnTracker.waitForDeployment();
  });

  it("Should record gas usage", async function () {
    await burnTracker.recordUsage(addr1.address, 100000, 5);

    const stats = await burnTracker.userStats(addr1.address);
    expect(stats.totalGasUsed).to.equal(100000);
    expect(stats.totalTransactions).to.equal(5);
  });

  it("Should return user stats via getMyStats", async function () {
    await burnTracker.recordUsage(addr1.address, 50000, 3);

    const stats = await burnTracker.connect(addr1).getMyStats();
    expect(stats.totalGasUsed).to.equal(50000);
    expect(stats.totalTransactions).to.equal(3);
  });

  it("Should accumulate gas usage across multiple records", async function () {
    await burnTracker.recordUsage(addr1.address, 100000, 1);
    await burnTracker.recordUsage(addr1.address, 150000, 2);

    const stats = await burnTracker.userStats(addr1.address);
    expect(stats.totalGasUsed).to.equal(250000);
    expect(stats.totalTransactions).to.equal(3);
  });
});