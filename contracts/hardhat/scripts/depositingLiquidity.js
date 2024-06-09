//0x5f96a7394eC5c2c8aC0AADa7B047841D16fFbcB3
const {ethers} = require("hardhat");
require("dotenv").config()

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_MUMBAI_URL);
    const privateKey = process.env.MUMBAI_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    const usdcABI = ['function approve(address spender, uint256 amount) returns (bool)'];
    const usdcAddress = "0xF4cc1F9cf050eBded41dC62ddD1396D7Dd8b5BCa";
    const usdcContract = new ethers.Contract(usdcAddress,usdcABI,wallet);
    const amount =  ethers.parseUnits("200", 6); // 6 decimal places for USDC   
    const approveTx = await usdcContract.approve("0x5f96a7394eC5c2c8aC0AADa7B047841D16fFbcB3", amount);
    const contractAddress = "0x5B6790946555a9B52b0dD6cC4603994562c65e31";
    const myContract = await ethers.getContractAt("LiquidityTokenizedVault", contractAddress,wallet);
    const tx = await myContract.deposit(amount,"0x4E48B4580775d83d160FF583816356e1e4c2915b");
    const tx1 = await myContract.balanceOf("0x4E48B4580775d83d160FF583816356e1e4c2915b");
    console.log("Trx hash:", tx);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {

        console.error(error);
        process.exit(1);
    });
