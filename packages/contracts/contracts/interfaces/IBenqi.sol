// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBenqiToken {
    // Returns 0 on success, error code on failure — NOT token amount
    function mint(uint256 mintAmount) external returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function redeem(uint256 redeemTokens) external returns (uint256);
    function exchangeRateCurrent() external returns (uint256);
}
