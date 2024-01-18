require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()

const MUMBAI_RPC_URL = process.env.ALCHEMY_MUMBAI_URL;
const PRIVATE_KEY = process.env.MUMBAI_PRIVATE_KEY;
const P_API = process.env.Polygon_API;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork:"hardhat",
  networks:{
    mumbai :{
      url: `${MUMBAI_RPC_URL}`,
      accounts: [`0x${[PRIVATE_KEY]}`],
    }
  },
  etherscan:{
    apiKey: {
      polygonMumbai :P_API
  }},
  solidity:{
    compilers: [
      {
        version: "0.8.16",
      },
      {
        version: "0.8.20",
        settings: {},
      },
    ],
  },
};
