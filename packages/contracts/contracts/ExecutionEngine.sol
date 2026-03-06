// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DCAVault.sol";
import "./BurnTracker.sol";
import "./interfaces/ITraderJoe.sol";
import "./interfaces/IBenqi.sol";

contract ExecutionEngine is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public factory;
    BurnTracker public burnTracker;
    bool public factoryLocked;

    // Avalanche mainnet addresses
    address public constant USDC         = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
    address public constant WAVAX        = 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7;
    address public constant LB_ROUTER    = 0x9A93a421b74F1c5755b83dD2C211614dC419C44b;
    address public constant BENQI_qiAVAX = 0x5c0401e81e6953a22c95311bc54060BDE84b1022;

    uint256 public constant SLIPPAGE  = 100;
    uint256 public constant PRECISION = 10000;
    event DCAExecuted(
        address indexed vault,
        address indexed user,
        uint256 usdcSpent,
        uint256 avaxReceived,
        uint256 qiTokens
    );
    event DCAFailed(address indexed vault, bytes reason);
    event FactoryUpdated(address indexed oldFactory, address indexed newFactory);

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }
    constructor(address _burnTracker) {
        require(_burnTracker != address(0), "Invalid BurnTracker");
        factory       = msg.sender;
        burnTracker   = BurnTracker(_burnTracker);
        factoryLocked = false;
    }

    // Called once after DCAFactory deployment, then locks permanently
    function setFactory(address _factory) external {
        require(_factory != address(0), "Zero address");
        require(msg.sender == factory,  "Not authorized");
        require(!factoryLocked,         "Factory already locked");
        address old   = factory;
        factory       = _factory;
        factoryLocked = true;
        emit FactoryUpdated(old, _factory);
    }

function executeDCA(address vault) external onlyFactory nonReentrant returns (bool) {
    uint256 gasStart   = gasleft();
    uint256 buyAmount;
    address vaultOwner;
    DCAVault dcaVault;

    {
        dcaVault = DCAVault(payable(vault));
        buyAmount  = dcaVault.buyAmount();
        vaultOwner = dcaVault.owner();
        require(buyAmount > 0, "Buy amount is zero");
    }

    IERC20 usdc = IERC20(USDC);
    usdc.safeTransferFrom(vaultOwner, address(this), buyAmount);
    usdc.forceApprove(LB_ROUTER, buyAmount);

    ILBRouter.Path memory path;
    path.pairBinSteps    = new uint256[](1);
    path.pairBinSteps[0] = 20;
    path.tokenPath       = new address[](2);
    path.tokenPath[0]    = USDC;
    path.tokenPath[1]    = WAVAX;

    uint256 amountOutMin = (buyAmount * (PRECISION - SLIPPAGE)) / PRECISION;

    uint256 avaxReceived = ILBRouter(LB_ROUTER).swapExactTokensForTokens(
        buyAmount,
        amountOutMin,
        path,
        address(this),
        block.timestamp + 300
    );
    require(avaxReceived > 0, "Swap returned zero");

    IERC20 wavax = IERC20(WAVAX);
    wavax.forceApprove(BENQI_qiAVAX, avaxReceived);

    IERC20 qiToken = IERC20(BENQI_qiAVAX);
    uint256 qiBefore  = qiToken.balanceOf(address(this));
    uint256 mintError = IBenqiToken(BENQI_qiAVAX).mint(avaxReceived);
    require(mintError == 0, "Benqi mint failed");
    uint256 qiTokens  = qiToken.balanceOf(address(this)) - qiBefore;
    require(qiTokens > 0, "No qiTokens received");

    qiToken.safeTransfer(vault, qiTokens);
    dcaVault.executeDCA();

    uint256 gasUsed = gasStart - gasleft();
    burnTracker.recordUsage(vaultOwner, gasUsed, 1);

    emit DCAExecuted(vault, vaultOwner, buyAmount, avaxReceived, qiTokens);
    return true;
}

    function executeBatch(address[] calldata vaults) external onlyFactory {
        require(vaults.length > 0, "Empty list");
        for (uint256 i = 0; i < vaults.length;) {
            try this._executeInternal(vaults[i]) {
            } catch (bytes memory reason) {
                emit DCAFailed(vaults[i], reason);
            }
            unchecked { ++i; }
        }
    }

    function _executeInternal(address vault) external nonReentrant {
        require(msg.sender == address(this), "Internal only");

        uint256 gasStart;
        uint256 buyAmount;
        address vaultOwner;
        DCAVault dcaVault;

        {
            dcaVault = DCAVault(payable(vault));
            gasStart   = gasleft();
            buyAmount  = dcaVault.buyAmount();
            vaultOwner = dcaVault.owner();
            require(buyAmount > 0, "Buy amount is zero");
        }

        IERC20 usdc = IERC20(USDC);
        usdc.safeTransferFrom(vaultOwner, address(this), buyAmount);
        usdc.forceApprove(LB_ROUTER, buyAmount);

        ILBRouter.Path memory path;
        path.pairBinSteps    = new uint256[](1);
        path.pairBinSteps[0] = 20;
        path.tokenPath       = new address[](2);
        path.tokenPath[0]    = USDC;
        path.tokenPath[1]    = WAVAX;

        uint256 amountOutMin = (buyAmount * (PRECISION - SLIPPAGE)) / PRECISION;

        uint256 avaxReceived = ILBRouter(LB_ROUTER).swapExactTokensForTokens(
            buyAmount, amountOutMin, path, address(this), block.timestamp + 300
        );
        require(avaxReceived > 0, "Swap returned zero");

        IERC20 wavax = IERC20(WAVAX);
        wavax.forceApprove(BENQI_qiAVAX, avaxReceived);

        IERC20 qiToken = IERC20(BENQI_qiAVAX);
        uint256 qiBefore  = qiToken.balanceOf(address(this));
        uint256 mintError = IBenqiToken(BENQI_qiAVAX).mint(avaxReceived);
        require(mintError == 0, "Benqi mint failed");
        uint256 qiTokens  = qiToken.balanceOf(address(this)) - qiBefore;
        require(qiTokens > 0, "No qiTokens received");

        qiToken.safeTransfer(vault, qiTokens);
        dcaVault.executeDCA();

        uint256 gasUsed = gasStart - gasleft();
        burnTracker.recordUsage(vaultOwner, gasUsed, 1);

        emit DCAExecuted(vault, vaultOwner, buyAmount, avaxReceived, qiTokens);
    }

    function isReady() external view returns (bool) {
        return factoryLocked && factory != address(0);
    }

    function getConfig() external view returns (
        address _factory,
        address _burnTracker,
        bool    _factoryLocked
    ) {
        return (factory, address(burnTracker), factoryLocked);
    }
}