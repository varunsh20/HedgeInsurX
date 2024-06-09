const {ethers} = require("hardhat");
require("dotenv").config()

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    const usdcABI = ['function approve(address spender, uint256 amount) returns (bool)'];
    const usdcAddress = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
    const usdcContract = new ethers.Contract(usdcAddress,usdcABI,wallet);
    const allowanceAmount =  ethers.parseUnits("1000000000", 6);
    const amount =  ethers.parseUnits("30", 6);
    const amount1 =  ethers.parseUnits("60", 6); // 6 decimal places for USDC
    const amount2 =  ethers.parseUnits("270", 6);
    const amount3 =  ethers.parseUnits("50", 6); 
    const amount4 =  ethers.parseUnits("120", 6); 
    const amount5 =  ethers.parseUnits("420", 6);
    const amount6 =  ethers.parseUnits("75", 6); 
    const amount7 =  ethers.parseUnits("160", 6); 
    const amount8 =  ethers.parseUnits("540", 6); 
    //const approveTx = await usdcContract.approve("0x9973956CF13924872d709680dde643c63c93E1C9", allowanceAmount);
    const contractAddress = "0x9973956CF13924872d709680dde643c63c93E1C9";
    const myContract = await ethers.getContractAt("RiskPool", contractAddress,wallet);
    //30 days = 30*24*60*60;
    // const p = await myContract.createPolicy("0","30","2592000",amount);
    // const p1 = await myContract.createPolicy("0","40","5184000",amount1);
    // const p2 = await myContract.createPolicy("0","50","15552000",amount2);
    // const p3 = await myContract.createPolicy("1","55","2592000",amount3);
    // const p4 = await myContract.createPolicy("1","65","5184000",amount4);
    // const p5 = await myContract.createPolicy("1","75","15552000",amount5);
    // const p6 = await myContract.createPolicy("2","80","2592000",amount6);
    // const p7 = await myContract.createPolicy("2","90","5184000",amount7);
    // const p8 = await myContract.createPolicy("2","95","15552000",amount8);
    //const tx = await myContract.getAllPolicies();
    //const t = await myContract.purchasePolicy(0);
    const tx = await myContract.getCustomerPolicies("0x4E48B4580775d83d160FF583816356e1e4c2915b");
    console.log("Trx hash:", tx);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {

        console.error(error);
        process.exit(1);
    });
