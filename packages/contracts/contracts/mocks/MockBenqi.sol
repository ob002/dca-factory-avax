// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// MockBenqi acts as BOTH the qiAVAX token AND the mint contract
// In real Mukebhi these are the same contract
contract MockBenqi is ERC20 {
    using SafeERC20 for IERC20;

    address public wavax;

    // Exchange rate: 1 WAVAX = 50 qiAVAX (simplified)
    uint256 public exchangeRate = 50e18;

    constructor(address _wavax) ERC20("Mock qiAVAX", "qiAVAX") {
        wavax = _wavax;
    }

    // Returns 0 on success — matches real Mukebhi interface exactly
    function mint(uint256 mintAmount) external returns (uint256) {
        // Pull WAVAX from caller
        IERC20(wavax).safeTransferFrom(msg.sender, address(this), mintAmount);

        // Mint qiAVAX to caller: mintAmount * exchangeRate / 1e18
        uint256 qiAmount = (mintAmount * exchangeRate) / 1e18;
        _mint(msg.sender, qiAmount);

        return 0; // 0 = success, matches Compound/Mukebhi standard
    }

    function setExchangeRate(uint256 _rate) external {
        exchangeRate = _rate;
    }
}
