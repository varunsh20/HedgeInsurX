//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract RiskPool{

   using SafeERC20 for ERC20;
    uint256 public _policyId;
    // The underlying asset accepted by the pool for payment of policies.
    ERC20 public immutable asset;

    //Liquidity vault contract
    ERC4626 public immutable liquidityVault;
    address immutable public owner;
    address public verifier;
    Policy[] private allPolicies;
    mapping(uint8=>Policy[]) private policiesByRiskCategory;
    mapping(address=>mapping(uint256=>CustomerPolicyDetails)) private customersPolicyDetails;
    mapping(address=>Policy[]) private customerPurchasedPolices;
    mapping(address=>ClaimDetails[]) private customerClaimRequests;
    ClaimDetails[] private allClaimRequests;

    enum RiskCategory{
        LOW,
        MEDIUM,
        HIGH
    }

    struct Policy{
        uint256 _id;
        RiskCategory risk;
        address asset;
        uint256 cover;
        uint256 period;
        uint256 premium;
    }

    struct CustomerPolicyDetails{
        address custAddress;
        uint256 policyId;
        uint256 purchasedAt;
        bool requestFiled;
        bool claimGranted;
    }

    struct ClaimDetails{
        address customer;
        string customerDID;
        string email;
        address protocol;
        uint256 estimatedLoss;
        string eventDate;
        uint256 policyId;
    }

    modifier OnlyOwner{
        require(msg.sender==owner,"Invalid User");
        _;
    }

    modifier InvalidPolicy(uint256 _id){
        require(_id>=0 && _id<=allPolicies.length,"Invalid policy Id");
        _;
    }

    modifier OnlyVerifier{
        require(msg.sender==verifier,"Invalid User");
        _;
    }

    event PolicyCreated(
        RiskCategory riskCategory,
        uint256 indexed id,
        address asset,
        uint256 lossCover,
        uint256 premium
    );

    event PolicyPurchased(
        address indexed user,
        uint256 id,
        uint256 purchasedAt
    );

    event ClaimRequestSubmitted(
        address indexed user,
        uint256 id,
        string mail,
        uint256 estimatedLoss
    );

    event ClaimRequestUpdated(
        uint256 indexed updatedAt
    );

    constructor(ERC20 _asset, ERC4626 _vault){
        owner=msg.sender;
        asset = _asset;
        liquidityVault = _vault;
    }

    function getAllPolicies() external view returns(Policy[] memory){
        return allPolicies;
    }

    function getPolicyById(uint256 _id) public view returns(Policy memory){
        return allPolicies[_id];
    }

    function getPoliciesByRisk(uint8 _risk) external view returns(Policy[] memory){
        return policiesByRiskCategory[_risk];
    }

    function createPolicy(uint8 _risk, uint256 _cover, uint256 _period, uint256 _premium) external OnlyOwner{
        Policy memory policy = Policy( _policyId, RiskCategory(_risk),address(asset),_cover,_period,_premium);
        allPolicies.push(policy);
        policiesByRiskCategory[_risk].push(policy);
        emit PolicyCreated(RiskCategory(_risk),_policyId,address(asset),_cover,_premium);
        _policyId++;
    }

    function purchasePolicy(uint256 _id) external InvalidPolicy(_id){
        require(!checkIfPolicyPurchased(msg.sender,_id),"Policy already purchased");
        Policy memory policy = allPolicies[_id];
        require(asset.allowance(msg.sender, address(this)) >= policy.premium, "Insufficient allowance");
        SafeERC20.safeTransferFrom(asset, msg.sender, address(liquidityVault), policy.premium);
        CustomerPolicyDetails memory customerPolicyDetails = CustomerPolicyDetails(msg.sender,_id,block.timestamp,false,false);
        customersPolicyDetails[msg.sender][_id] = customerPolicyDetails;
        customerPurchasedPolices[msg.sender].push(policy);
        emit PolicyPurchased(msg.sender,_id,block.timestamp);
    }

    function checkIfPolicyPurchased(address _user, uint256 _id) private view returns(bool){
        Policy memory policy = getPolicyById(_id);
        bool isUser = customersPolicyDetails[_user][_id].custAddress==_user;
        bool isExpired = (customersPolicyDetails[_user][_id].purchasedAt+policy.period)>block.timestamp?false:true;
        return (isUser || !isExpired)?true:false;
    }

    function getCustomerPolicies(address _address) external view returns(Policy[] memory){
        return customerPurchasedPolices[_address];
    }

    function getCustomerPolicesDetails(address _address, uint256 _policy) external InvalidPolicy(_policy) view
    returns(CustomerPolicyDetails memory){
        return customersPolicyDetails[_address][_policy];
    }

    function makeClaimRequest(string memory customerDID, string memory email, address _protocol, string calldata _eventDate, 
    uint256 _estimatedLoss, uint256 _policy) external
        InvalidPolicy(_policy){
        require(checkPolicyValidity(msg.sender,_policy),"Can't process the request");
        ClaimDetails memory claimDetails = ClaimDetails(msg.sender,customerDID, email, _protocol, _estimatedLoss, _eventDate, _policy);
        customersPolicyDetails[msg.sender][_policy].requestFiled = true;
        customerClaimRequests[msg.sender].push(claimDetails);
        allClaimRequests.push(claimDetails);
        emit ClaimRequestSubmitted(msg.sender,_policy, email,_estimatedLoss);
    }
    
    function checkPolicyValidity(address _user, uint256 _policy) private InvalidPolicy(_policy) view returns(bool){
        require(checkIfPolicyPurchased(_user,_policy),"No such policy purchased by user");
        Policy memory policy = getPolicyById(_policy);
        CustomerPolicyDetails memory policyDetails = customersPolicyDetails[_user][_policy];
        bool isExpired = (policyDetails.purchasedAt+policy.period)>block.timestamp?false:true;
        bool isClaimGranted = policyDetails.claimGranted;
        bool isRequestFiled = policyDetails.requestFiled;
        return (!isExpired && !isClaimGranted && !isRequestFiled)?true:false;
    }

    function setVerifier(address _verifier) external OnlyOwner{
        require(_verifier!=address(0),"invalid verifier");
        verifier = _verifier;
    }

    function updateClaimRequest(address user, uint256 _Id) external OnlyVerifier InvalidPolicy(_Id){
        require(verifier!=address(0),"invalid verifier");
        customersPolicyDetails[user][_Id].claimGranted = true;
        emit ClaimRequestUpdated(block.timestamp);
    }

    function getCustomerClaimRequests(address _user) external view returns(ClaimDetails[] memory){
        return customerClaimRequests[_user];
    }

    function getAllClaimRequests() external OnlyOwner view returns(ClaimDetails[] memory){
        return allClaimRequests;
    }
}
