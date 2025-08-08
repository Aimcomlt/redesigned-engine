// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC3156FlashBorrower} from "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import {IERC3156FlashLender} from "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";

interface ISwapRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

/// @title ArbExecutor
/// @notice Executes a swap route using a flash loan and keeps any profit.
contract ArbExecutor is IERC3156FlashBorrower {
    IERC3156FlashLender public lender;
    ISwapRouter public router;

    constructor(IERC3156FlashLender _lender, ISwapRouter _router) {
        lender = _lender;
        router = _router;
    }

    /// @notice Initiate a flash loan and arbitrage route.
    /// @param token The token to borrow and repay.
    /// @param amount The amount to borrow.
    /// @param path Swap route ending back at `token`.
    function execute(address token, uint256 amount, address[] calldata path) external {
        bytes memory data = abi.encode(path);
        lender.flashLoan(this, token, amount, data);
    }

    /// @inheritdoc IERC3156FlashBorrower
    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {
        require(msg.sender == address(lender), "untrusted lender");
        require(initiator == address(this), "untrusted initiator");

        address[] memory path = abi.decode(data, (address[]));

        IERC20(token).approve(address(router), amount);
        router.swapExactTokensForTokens(amount, 0, path, address(this), block.timestamp);

        uint256 repay = amount + fee;
        IERC20(token).approve(msg.sender, repay);

        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }
}

