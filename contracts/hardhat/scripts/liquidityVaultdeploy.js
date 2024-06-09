const {ethers} = require("hardhat");

const ASSET_ADDRESSS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
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

//0xF4cc1F9cf050eBded41dC62ddD1396D7Dd8b5BCa
