// SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Strategy{

    uint256 private totalAssets;
    address public immutable owner;

    mapping(uint256=>uint256) private assetsByStrategy;
    mapping(address=>mapping(uint256=>uint256)) private userFundsByStrategy;

    address[] private supportedAssets;

    modifier OnlyOwner(){
        require(msg.sender==owner,"Only owner operation");
        _;
    }

    modifier AddressCheck(address _addr){
        require(_addr!=address(0),"Invalid address");
        _;
    }

    event FeesDeducted(
        uint256 time,
        uint64 id,
        address from,
        address to,
        uint256 amount
    );

    event FundsWithdrawn(
        uint256 time,
        uint64 id,
        uint256 amount,
        address user
    );

    constructor(){
        owner = msg.sender;
    } 

    function updateSupportedAsset(address _asset) external OnlyOwner AddressCheck(_asset){
        supportedAssets.push(_asset);
    }
    
    function checkAssetSupported(address _asset) public AddressCheck(_asset) view returns(bool){
        for(uint64 i=0;i<=supportedAssets.length;i++){
            if(_asset==supportedAssets[i]){
                return true;
            }
        }
        return false;
    }

    function deductFees(uint64 _id, address _asset,uint256 _fees,uint256 _amount) external AddressCheck(_asset) {
        require(checkAssetSupported(_asset),"Unsupported asset");
        IERC20 asset = IERC20(_asset);
        uint256 allowance = asset.allowance(msg.sender,address(this));
        require(allowance>=_fees,"Insufficient allowance");
        totalAssets+=_amount;
        assetsByStrategy[_id]+=_amount;
        userFundsByStrategy[msg.sender][_id]+=_amount;
        asset.transferFrom(msg.sender,address(this),_fees);
        emit FeesDeducted(block.timestamp,_id,msg.sender,address(this),_fees);
    }

    function withdraw(uint64 _id, uint256 _amount, address user) external OnlyOwner{
        totalAssets-=_amount;
        assetsByStrategy[_id]-=_amount;
        userFundsByStrategy[user][_id]-=_amount;
        emit FundsWithdrawn(block.timestamp,_id,_amount,msg.sender);
    }

    function getTotalAssets() external view returns(uint256){
        return totalAssets;
    }

    function getassetsByStrategy(uint256 _id) external view returns(uint256){
        return assetsByStrategy[_id];
    }

    function getUserFunds(address _user, uint64 _strategyId) external AddressCheck(_user) view returns(uint256){
        return userFundsByStrategy[_user][_strategyId];
    }
}