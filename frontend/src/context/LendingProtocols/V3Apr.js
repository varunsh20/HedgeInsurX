import { ethers } from 'ethers';
import {UiPoolDataProvider,UiIncentiveDataProvider,ChainId} from '@aave/contract-helpers';
import * as markets from '@bgd-labs/aave-address-book';
import { formatReservesAndIncentives ,formatUserSummaryAndIncentives,formatReserves} from '@aave/math-utils';
import dayjs from 'dayjs';
import Compound from '@compound-finance/compound-js';

const RPC_URL = import.meta.env.VITE_RPC_URL;
const privateKey = import.meta.env.VITE_PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL,);

const cometUSDCPool = import.meta.env.VITE_COMET_USDC;
const compoundUSDC = import.meta.env.VITE_COMPOUND_USDC;

const aavePool = import.meta.env.VITE_AAVE_POOL;
const aaveUSDC =  import.meta.env.VITE_AAVE_USDC;


export default async function getAPYDetails(){
  const aaveUSDC = await fetchAaveData();
  const compoundUSDC = await fetchCompoundData().catch((error) => {
    console.error('Error retrieving supply rate:', error);
  })
  return (aaveUSDC.APY>compoundUSDC.APY?aaveUSDC:compoundUSDC);
}

async function fetchAaveData() {

    // User address to fetch data for, insert address here
  const currentAccount = '0x4e48b4580775d83d160ff583816356e1e4c2915b';

  // View contract used to fetch all reserves data (including market base currency data), and user reserves
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: markets.AaveV3Sepolia.UI_POOL_DATA_PROVIDER,
    provider,
    chainId: ChainId.sepolia,
  });

  // View contract used to fetch all reserve incentives (APRs), and user incentives
  const incentiveDataProviderContract = new UiIncentiveDataProvider({
    uiIncentiveDataProviderAddress:
    markets.AaveV3Sepolia.UI_INCENTIVE_DATA_PROVIDER,
    provider,
    chainId: ChainId.sepolia,
  });

  let usdcInfo;
  const reserves = await poolDataProviderContract.getReservesHumanized({
    lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
  });
  
  const userReserves = await poolDataProviderContract.getUserReservesHumanized({
    lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
    user: currentAccount,
  });

  // Array of incentive tokens with price feed and emission APR
  const reserveIncentives =
    await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
      lendingPoolAddressProvider:
        markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
    });

  // Dictionary of claimable user incentives
  const userIncentives =
    await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
      lendingPoolAddressProvider:
        markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
      user: currentAccount,
    });

  const reservesArray = reserves.reservesData;  
  const baseCurrencyData = reserves.baseCurrencyData;
  const userReservesArray = userReserves.userReserves;
  
  const currentTimestamp = dayjs().unix();

  const formattedPoolReserves = formatReservesAndIncentives({
    reserves: reservesArray,
    currentTimestamp,
    marketReferenceCurrencyDecimals:
    baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    reserveIncentives,
  });
  formattedPoolReserves.map(reserve=>{
    if(reserve.name=="USDC"){
        usdcInfo = reserve;
    }
  })
  const formattedReserves = formatReserves({
    reserves: reservesArray,
    currentTimestamp,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });
  const userSummary = formatUserSummaryAndIncentives({
    currentTimestamp,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves: userReservesArray,
    formattedReserves,
    userEmodeCategoryId: userReserves.userEmodeCategoryId,
    reserveIncentives,
    userIncentives,
  }); 
  return ({APY:usdcInfo.supplyAPY*100,BorrowAPY:usdcInfo.variableBorrowAPY*100,Address:usdcInfo.underlyingAsset,Pool:aavePool});
}

const cometAbi = [
  'function getSupplyRate(uint) public view returns (uint)',
  'function getBorrowRate(uint) public view returns (uint)',
  'function getUtilization() public view returns (uint)',
  'function baseTokenPriceFeed() public view returns (address)',
  'function getPrice(address) public view returns (uint128)',
  'function totalSupply() external view returns (uint256)',
  'function totalBorrow() external view returns (uint256)',
  'function baseIndexScale() external pure returns (uint64)',
  'function baseTrackingSupplySpeed() external view returns (uint)',
  'function baseTrackingBorrowSpeed() external view returns (uint)',
];

async function fetchCompoundData(){
  const SECONDS_PER_YEAR = 31536000
  const comet = new ethers.Contract(cometUSDCPool, cometAbi, provider);
  const utilization = await comet.getUtilization();
  const supplyRate = await comet.getSupplyRate(utilization);
  const supplyAPY = (supplyRate/Math.pow(10,18))*SECONDS_PER_YEAR*100;
  const borrowRate = await comet.getBorrowRate(utilization);
  const borrowAPY = (borrowRate/Math.pow(10,18))*SECONDS_PER_YEAR*100;
  return ({APY:supplyAPY,BorrowAPY:borrowAPY,Address:compoundUSDC,Pool:cometUSDCPool});
}
