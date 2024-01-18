const {ethers} = require("hardhat");
const { expect } = require("chai");


describe("Tests related to liquidity token vault",()=>{
  let owner,addr1,addr2,addr3;
  let vaultContract;
  let vaultContractAddress;
  let assetContract;
  let assetAddress;

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
    await assetContract.connect(owner).approve(vaultContractAddress,10000000000000);
    await assetContract.connect(addr1).approve(vaultContractAddress,1000000000000000);
    await assetContract.transfer(addr1,100000);
  })

  describe("Tests related to asset deposits",()=>{
    it("Should deposit given number of assets into the vault",async()=>{
      await vaultContract.connect(addr1).deposit(100,addr1);
      expect(await assetContract.balanceOf(vaultContractAddress)).to.equal(100);
    });
  })

  describe("Tests related to fees and rewards",()=>{
    it("Should calculate the fees earned by a liquidity provider",async()=>{
      await vaultContract.connect(addr1).deposit(100,addr1);
      expect(await vaultContract.previewEarnedFees(addr1)).to.equal(2);
    });

    it("Should calculate the dividneds earned by a liquidity provider",async()=>{
      await vaultContract.connect(addr1).deposit(100,addr1);
      expect(await vaultContract.previewDividendsRewards(addr1)).to.equal(100);
    });
  })

  describe("Tests related to assets withdrawls",()=>{
    it("Should allow a user to withdraw their assets",async()=>{
      await vaultContract.connect(addr1).deposit(100,addr1);
      await vaultContract.connect(addr1).withdraw(99,addr1,addr1);
      expect(await assetContract.balanceOf(vaultContractAddress)).to.equal(1);
    })
  })
})