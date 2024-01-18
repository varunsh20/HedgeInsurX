const {ethers} = require("hardhat");

const LIQUIDITY_VAULT = "0x22d17a4eBef6b2745E692440507F25E57cA15ac9"
const ASSET_ADDRESSS = "0x52d800ca262522580cebad275395ca6e7598c014";
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

//0xB5b4f5245849DBb8a50F715Ae1486a0DE99a4f7c