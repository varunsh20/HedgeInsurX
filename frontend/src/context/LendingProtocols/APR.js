// import { TxBuilderV2, Network, Market} from '@aave/protocol-js'
// //import pkg from '@aave/contract-helpers';
// import  ReserveDataHumanized  from '@aave/contract-helpers';
// import { formatReserves } from '@aave/protocol-js';
// import LendingPool from '../../../../backend/AaveLendingPool/LendingPool.json'  assert { type: "json" };
// import { ethers } from 'ethers';

// //const RPC_URL =  import.meta.env.VITE_RPC_URL;

//  const httpProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/B4HZBW5VlKKuMvgYcgRMSEHPO_tFEwd1");

// // const txBuilder = new TxBuilderV2(Network.mumbai, httpProvider);

// // const lendingPool = txBuilder.getLendingPool(Market.Proto); // get all lending pool methods
// // console.log(formatReserves(reserves, currentTimestamp));

//  export default async function APR(){

//         const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/B4HZBW5VlKKuMvgYcgRMSEHPO_tFEwd1");
//         const lendingPool = new ethers.Contract("0xcC6114B983E4Ed2737E9BD3961c9924e6216c704",LendingPool,provider);
//         const [, liquidityIndex, variableBorrowIndex, 
//             currentLiquidityRate, currentVariableBorrowRate,
//             currentStableBorrowRate, ,
//             aTokenAddress, stableDebtTokenAddress,
//             variableDebtTokenAddress, , ] = await lendingPool.getReserveData("0x52D800ca262522580CeBAD275395ca6e7598C014");
//         //console.log(await lendingPool.getReserveData("0x52d800ca262522580cebad275395ca6e7598c014"));
//         const RAY = Math.pow(10,27) // 10 to the power 27
//         const SECONDS_PER_YEAR = 31536000

//         // Deposit and Borrow calculations
//         // APY and APR are returned here as decimals, multiply by 100 to get the percents
//         const depositAPR = currentLiquidityRate/RAY
//         const variableBorrowAPR = currentVariableBorrowRate/RAY
//         const stableBorrowAPR = currentStableBorrowRate/RAY
//         const depositAPY = (Math.pow(1 + depositAPR / SECONDS_PER_YEAR, SECONDS_PER_YEAR)) - 1;
//         const variableBorrowAPY = (Math.pow(1 + variableBorrowAPR / SECONDS_PER_YEAR, SECONDS_PER_YEAR)) - 1;
//         const stableBorrowAPY = (Math.pow(1 + stableBorrowAPR / SECONDS_PER_YEAR, SECONDS_PER_YEAR)) - 1;
//         return [depositAPY,variableBorrowAPY,stableBorrowAPY];
// }
// APR();