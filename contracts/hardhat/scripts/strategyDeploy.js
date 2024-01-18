const {ethers} = require("hardhat");

const main = async()=>{

    const contract = await ethers.getContractFactory("Strategy");
    const deployContract = await contract.deploy();
    await deployContract.waitForDeployment();
    console.log("Contract address: ", await deployContract.getAddress());
}
main()
.then(()=>process.exit(0))
.catch((error)=>{
    console.log(error);
    process.exit(1);
});