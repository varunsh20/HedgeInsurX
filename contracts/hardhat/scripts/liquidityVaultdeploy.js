const {ethers} = require("hardhat");

const ASSET_ADDRESSS = "0x52d800ca262522580cebad275395ca6e7598c014";
const main = async()=>{
  const contract = await ethers.getContractFactory("LiquidityTokenizedVault");
  const deployContract = await contract.deploy(ASSET_ADDRESSS);
  await deployContract.waitForDeployment();
  console.log("Contract Address: ", await deployContract.getAddress());
}

main()
.then(()=>process.exit(0))
.catch((error)=>{
    console.log(error);
    process.exit(1);
});

//0x5f96a7394eC5c2c8aC0AADa7B047841D16fFbcB3