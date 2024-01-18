//0x5f96a7394eC5c2c8aC0AADa7B047841D16fFbcB3
const {ethers} = require("hardhat");
require("dotenv").config()

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_MUMBAI_URL);
    const privateKey = process.env.MUMBAI_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    const usdcABI = ['function approve(address spender, uint256 amount) returns (bool)'];
    const usdcAddress = "0x52d800ca262522580cebad275395ca6e7598c014";
    const usdcContract = new ethers.Contract(usdcAddress,usdcABI,wallet);
    const amount =  ethers.parseUnits("200", 6); // 6 decimal places for USDC   
    //const approveTx = await usdcContract.approve("0x5f96a7394eC5c2c8aC0AADa7B047841D16fFbcB3", amount);
    const contractAddress = "0x22d17a4eBef6b2745E692440507F25E57cA15ac9";
    const myContract = await ethers.getContractAt("LiquidityTokenizedVault", contractAddress,wallet);
    //const tx = await myContract.deposit(amount,"0xA540e0e41c4141009800a257255907F578Dc1815");
    const tx = await myContract.balanceOf("0xA540e0e41c4141009800a257255907F578Dc1815");
    console.log("Trx hash:", tx);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {

        console.error(error);
        process.exit(1);
    });