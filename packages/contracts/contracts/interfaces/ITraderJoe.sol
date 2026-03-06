// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILBRouter {
    struct Path {
        uint256[] pairBinSteps;
        address[] tokenPath;
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Path calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);
}
