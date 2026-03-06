// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DCAVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public owner;
    address public factory;
    uint256 public buyAmount;
    uint256 public frequency;
    uint256 public lastExecution;
    uint256 public totalInvested;
    uint256 public executionCount;
    bool public active;

    event DCAExecuted(uint256 amountSpent, uint256 timestamp);
    event Withdrawn(address indexed token, uint256 amount);
    event VaultPaused();
    event VaultResumed();

    modifier onlyFactory() { require(msg.sender == factory, "Only factory"); _; }
    modifier onlyOwner()   { require(msg.sender == owner,   "Only owner");   _; }

    constructor(address _owner) {
        require(_owner != address(0), "Invalid owner");
        owner   = _owner;
        factory = msg.sender;
        active  = true;
    }

    function initialize(uint256 _buyAmount, uint256 _frequency) external onlyFactory {
        require(_buyAmount > 0, "Invalid buy amount");
        require(_frequency > 0, "Invalid frequency");
        require(buyAmount == 0, "Already initialized");
        buyAmount     = _buyAmount;
        frequency     = _frequency;
        lastExecution = block.timestamp;
    }

    function canExecute() external view returns (bool) {
        return active && block.timestamp >= lastExecution + frequency;
    }

    function executeDCA() external onlyFactory nonReentrant returns (bool) {
        require(active, "Vault is paused");
        require(block.timestamp >= lastExecution + frequency, "Too soon");
        executionCount++;
        lastExecution  = block.timestamp;
        totalInvested += buyAmount;
        emit DCAExecuted(buyAmount, block.timestamp);
        return true;
    }

    function pause()  external onlyOwner { require(active,  "Already paused");  active = false; emit VaultPaused();  }
    function resume() external onlyOwner { require(!active, "Already active");  active = true;  emit VaultResumed(); }

    function updateSettings(uint256 _buyAmount, uint256 _frequency) external onlyOwner {
        require(_buyAmount > 0, "Invalid buy amount");
        require(_frequency > 0, "Invalid frequency");
        buyAmount = _buyAmount;
        frequency = _frequency;
    }

    function withdraw(address token, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).safeTransfer(owner, amount);
        emit Withdrawn(token, amount);
    }

    function withdrawAVAX(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(address(this).balance >= amount, "Insufficient AVAX");
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "AVAX transfer failed");
        emit Withdrawn(address(0), amount);
    }

    function getStatus() external view returns (
        uint256 _buyAmount, uint256 _frequency, uint256 _lastExecution,
        uint256 _nextExecution, uint256 _totalInvested, uint256 _executionCount,
        bool _active, bool _canExecute
    ) {
        return (buyAmount, frequency, lastExecution, lastExecution + frequency,
                totalInvested, executionCount, active,
                active && block.timestamp >= lastExecution + frequency);
    }

    receive() external payable {}
}