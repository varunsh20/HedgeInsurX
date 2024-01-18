// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract LiquidityTokenizedVault is ERC4626 {

    uint256 public claimsdAmountPaid;
    uint256 public constant FEES_PERCENT = 2;
    uint256 public constant DIVIDEND_THRESOLD = 30;
    uint256 public constant dividendPeriod = 30 days;
    uint256 MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    uint256 public rewardsApplicable;
    address public immutable _owner;
    ERC20 private immutable _asset;

    address[] public liquidityProviders;
    mapping(address=>uint256) public liquidityProvided;

    event LiquidityDeposited(
        address indexed provider,
        address token,
        uint256 assets
    );

    event LiquidityWithdrawn(
        address indexed provider,
        address token,
        uint256 assets
    );

    event RewardsDistributed(
        address indexed owner,
        uint256 rewardedAt,
        uint256 totalAssetsDistributed
    );

    modifier OnlyOwner{
        require(_msgSender()==_owner,"Only owner operation");
        _;
    }

    modifier NoLiquidity(address _address){
        require(liquidityProvided[_address]>0,"No liquidity");
        _;
    }
    constructor(ERC20 asset)  ERC4626(asset) ERC20("Share Tokens","SHT"){
        _asset = asset;
        _owner = msg.sender;
        rewardsApplicable = block.timestamp+dividendPeriod;
    }

    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        uint256 maxAssets = maxDeposit(receiver);
        if (assets > maxAssets) {
            revert ERC4626ExceededMaxDeposit(receiver, assets, maxAssets);
        }
        uint256 shares = previewDeposit(assets);
        _deposit(_msgSender(), receiver, assets, shares);
        liquidityProviders.push(_msgSender());
        liquidityProvided[receiver]+=assets;
        emit LiquidityDeposited(receiver,address(_asset),assets);
        return shares;
    }

    function withdraw(uint256 assets, address receiver, address owner) public override returns (uint256) {
        uint256 maxAssets = maxWithdraw(owner);
        require(assets<_asset.balanceOf(address(this)),"Insufficient funds");
        if (assets > maxAssets) {
            revert ERC4626ExceededMaxWithdraw(owner, assets, maxAssets);
        }
        uint256 shares = previewWithdraw(assets);
        _withdraw(_msgSender(), receiver, owner, assets, shares);
        liquidityProvided[receiver]-=assets;
        emit LiquidityWithdrawn(receiver,address(_asset),assets);
        return shares;
    }

    //Liquidity providers earn's a constant fees of 2% of the liquidity they provide;
    function previewEarnedFees(address _user) public NoLiquidity(_user) view returns(uint256){
        return (liquidityProvided[_user]*FEES_PERCENT)/(100);
    }

    //Liquidity providers earns dividends based on the proportion of liquidity they provide 
    function previewDividendsRewards(address _user) public NoLiquidity(_user) view returns(uint256){
        return (totalAssets()*balanceOf(_user))/(totalSupply());
    }

    function distributeFeesAndDividends() external OnlyOwner{
        require(block.timestamp>=rewardsApplicable,"Not valid yet");
        uint256 assets = 0;
        for(uint64 i=0;i<liquidityProviders.length;i++){
            address receiver = liquidityProviders[i];
            uint256 fees = previewEarnedFees(receiver);
            assets = isDividendsApplicable()?(fees+previewDividendsRewards(receiver)):fees;
            SafeERC20.safeTransfer(_asset, receiver, assets);
        }
        rewardsApplicable = block.timestamp+dividendPeriod;
        emit RewardsDistributed(_owner, block.timestamp,assets);
    }

    //Dividend rewards are only applicable when the amount claimed during that month is less than 30% of pool's funds
    function isDividendsApplicable() private OnlyOwner view returns(bool){
        uint256 claimsThreshold = (totalAssets()*DIVIDEND_THRESOLD)/(100);
        return claimsdAmountPaid<=claimsThreshold?true:false;
    }

    //Vault must give allownace to verifier contract for transferring funds after claim request is verified
    function giveAllowanceToVerifier(address _verifierContract) OnlyOwner external{
        _asset.approve(_verifierContract,MAX_INT);
    }
}