const {ethers} = require("hardhat");
const { expect } = require("chai");


describe("Tests related to liquidity token vault",()=>{
  let owner,addr1,addr2,addr3;
  let vaultContract;
  let vaultContractAddress;
  let assetContract;
  let assetAddress;
  let riskPoolContract;
  let riskPoolAddress;

  beforeEach(async()=>{
    [owner,addr1,addr2,addr3] =await ethers.getSigners();
    const tokenContractFactory = await ethers.getContractFactory("TestUSDC");
    assetContract = await tokenContractFactory.deploy();
    await assetContract.waitForDeployment();
    assetAddress = await assetContract.getAddress();
    const contractFactory = await ethers.getContractFactory("LiquidityTokenizedVault");
    vaultContract = await contractFactory.deploy(assetAddress);
    await vaultContract.waitForDeployment();
    vaultContractAddress = await vaultContract.getAddress();
    const poolContractFactory = await ethers.getContractFactory("RiskPool");
    riskPoolContract = await poolContractFactory.deploy(assetAddress,vaultContractAddress,);
    await riskPoolContract.waitForDeployment();
    riskPoolAddress = await riskPoolContract.getAddress();
    await assetContract.connect(owner).approve(vaultContractAddress,10000000000000);
    await assetContract.connect(addr1).approve(vaultContractAddress,1000000000000000);
    await assetContract.connect(addr2).approve(riskPoolAddress,1000000000000000);
    await assetContract.transfer(addr1,100000);
    await assetContract.transfer(addr2,100000);
    await vaultContract.connect(addr1).deposit(100,addr1);
  })

  describe("Tests related to policies creation",()=>{
    it("Should create and fetch policies",async()=>{
        await riskPoolContract.createPolicy(0,30,400000,100);
        const allPolicies = await riskPoolContract.getAllPolicies();
        const policyById = await riskPoolContract.getPolicyById(0);
        const policiesByRisk = await riskPoolContract.getPoliciesByRisk(0);
        expect(allPolicies.length).to.equal(1);
        expect(parseInt(policyById[0])).to.equal(0);
        expect(policiesByRisk.length).to.equal(1);
    });
  })

  describe("Tests related to policy purchase",()=>{
    it("Should allow customers to purchase policy",async()=>{
        await riskPoolContract.createPolicy(0,30,400000,100);
        await riskPoolContract.connect(addr2).purchasePolicy(0);
        const custPolicies = await riskPoolContract.getCustomerPolicies(addr2);
        expect(custPolicies.length).to.equal(1);
        expect(await assetContract.balanceOf(vaultContractAddress)).to.equal(200);
    });

    it("Should check for customer's purchases policies",async()=>{
      await riskPoolContract.createPolicy(0,30,400000,100);
      await riskPoolContract.connect(addr2).purchasePolicy(0);
      const custPoliciesDetails = await riskPoolContract.getCustomerPolicesDetails(addr2,0);
      expect(custPoliciesDetails[3]).to.equal(false);
      expect(custPoliciesDetails[4]).to.equal(false);
    });
  })

  describe("Tests related to insurance claim requests",()=>{
    beforeEach(async()=>{
      await riskPoolContract.createPolicy(0,30,400000,100);
      await riskPoolContract.connect(addr2).purchasePolicy(0);
      await riskPoolContract.connect(addr2).makeClaimRequest("dideqweqw", "abc@gmail.com", addr3,"23/12/2022",30,0);
    });

    it("Should allow a customer to make a claim request",async()=>{
      const claimRequests = await riskPoolContract.getAllClaimRequests();
      expect(claimRequests.length).to.equal(1);
    });

    it("Should check for customer's claim requests",async()=>{
      const custClaimRequests = await await riskPoolContract.getCustomerClaimRequests(addr2);
      expect(custClaimRequests[0][4]).to.equal("23/12/2022");
    });
  })
})