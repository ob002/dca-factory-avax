// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DCAVault.sol";
import "./ExecutionEngine.sol";

contract DCAFactory {

    address public owner;
    address public executionEngine;
    address public burnTracker;

    address[] public allVaults;
    mapping(address => address) public userVault;

    event VaultCreated(address indexed user, address indexed vault);
    event ExecutionEngineSet(address indexed executionEngine);
    event BurnTrackerSet(address indexed burnTracker);
    event DCATriggered(address indexed vault, address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setBurnTracker(address _burnTracker) external onlyOwner {
        require(_burnTracker != address(0), "Zero address");
        require(burnTracker == address(0), "Already set");
        burnTracker = _burnTracker;
        emit BurnTrackerSet(_burnTracker);
    }

    function setExecutionEngine(address _executionEngine) external onlyOwner {
        require(_executionEngine != address(0), "Zero address");
        require(executionEngine == address(0), "Already set");
        executionEngine = _executionEngine;
        emit ExecutionEngineSet(_executionEngine);
    }

    function createVault(uint256 _buyAmount, uint256 _frequency) external returns (address) {
        require(userVault[msg.sender] == address(0), "Vault already exists");
        require(_buyAmount > 0, "Buy amount is zero");
        require(_frequency > 0, "Frequency is zero");

        DCAVault vault = new DCAVault(msg.sender);
        vault.initialize(_buyAmount, _frequency);

        userVault[msg.sender] = address(vault);
        allVaults.push(address(vault));

        emit VaultCreated(msg.sender, address(vault));
        return address(vault);
    }

    function getMyVault() external view returns (address) {
        return userVault[msg.sender];
    }

    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }

    function triggerDCA(address user) external {
        require(executionEngine != address(0), "ExecutionEngine not set");
        address payable vault = payable(userVault[user]);
        require(vault != address(0), "No vault for user");
        require(DCAVault(vault).canExecute(), "Too soon to execute");

        ExecutionEngine(executionEngine).executeDCA(vault);
        emit DCATriggered(vault, user);
    }

    function triggerBatchDCA(address[] calldata users) external {
        require(executionEngine != address(0), "ExecutionEngine not set");
        require(users.length > 0, "Empty list");

        address[] memory vaults = new address[](users.length);
        uint256 count = 0;

        for (uint256 i = 0; i < users.length;) {
            address payable vault = payable(userVault[users[i]]);
            if (vault != address(0) && DCAVault(vault).canExecute()) {
                vaults[count] = address(vault);
                unchecked { ++count; }
            }
            unchecked { ++i; }
        }

        require(count > 0, "No vaults ready");

        assembly { mstore(vaults, count) }

        ExecutionEngine(executionEngine).executeBatch(vaults);
    }
}