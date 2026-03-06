// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BurnTracker {
    struct UserStats {
        uint256 totalGasUsed;
        uint256 totalTransactions;
        uint256 avaxBurned;
    }
    
    mapping(address => UserStats) public userStats;
    
    event GasTracked(address user, uint256 gasUsed, uint256 txCount);
    
    function recordUsage(address user, uint256 gasUsed, uint256 txCount) external {
        UserStats storage stats = userStats[user];
        stats.totalGasUsed += gasUsed;
        stats.totalTransactions += txCount;
        stats.avaxBurned += gasUsed * 25 gwei;
        emit GasTracked(user, gasUsed, txCount);
    }
    
    function getMyStats() external view returns (UserStats memory) {
        return userStats[msg.sender];
    }
}