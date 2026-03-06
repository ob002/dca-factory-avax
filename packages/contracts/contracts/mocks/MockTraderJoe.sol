// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ITraderJoe.sol";

contract MockTraderJoe {
    using SafeERC20 for IERC20;

    // Simulated exchange rate: 1 USDC (6 dec) = 0.05 WAVAX (18 dec)
    // meaning 1 USDC buys 0.05 AVAX
    uint256 public exchangeRate = 5e16; // 0.05 WAVAX per USDC

    address public wavax;

    constructor(address _wavax) {
        wavax = _wavax;
    }

    function setExchangeRate(uint256 _rate) external {
        exchangeRate = _rate;
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        ILBRouter.Path calldata path,
        address to,
        uint256 /*deadline*/
    ) external returns (uint256 amountOut) {
        // Pull USDC from caller
        IERC20(path.tokenPath[0]).safeTransferFrom(
            msg.sender,
            address(this),
            amountIn
        );

        // Calculate WAVAX out
        // amountIn is in USDC (6 decimals), amountOut in WAVAX (18 decimals)
        amountOut = (amountIn * exchangeRate * 1e12) / 1e18;

        require(amountOut >= amountOutMin, "MockTraderJoe: insufficient output");

        // Send WAVAX to recipient
        IERC20(wavax).safeTransfer(to, amountOut);

        return amountOut;
    }
}
