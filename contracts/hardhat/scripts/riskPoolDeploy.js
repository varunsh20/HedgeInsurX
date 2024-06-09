const {ethers} = require("hardhat");

const LIQUIDITY_VAULT = "0xd3EA3Ba54a6613D2441c0ec176354d1d5467FE3f"
const ASSET_ADDRESSS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
const main = async()=>{
    const contract = await ethers.getContractFactory("RiskPool");
    const deployContract = await contract.deploy(ASSET_ADDRESSS,LIQUIDITY_VAULT);
    await deployContract.waitForDeployment();
    console.log("Contract address: ", await deployContract.getAddress());
}

main()
.then(()=>process.exit(0))
.catch((error)=>{
    console.log(error);
    process.exit(1);
});


//0xcdCE7F23455e468c14b8F32c303DE36f6f3E7025
