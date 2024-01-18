import { ethers } from 'ethers';
import {UiPoolDataProvider,UiIncentiveDataProvider,ChainId} from '@aave/contract-helpers';
import * as markets from '@bgd-labs/aave-address-book';
import { formatUserSummaryAndIncentives,formatReserves} from '@aave/math-utils';
import dayjs from 'dayjs';
import Compound from '@compound-finance/compound-js';

const provider = new ethers.providers.JsonRpcProvider(
  'https://polygon-mumbai.g.alchemy.com/v2/B4HZBW5VlKKuMvgYcgRMSEHPO_tFEwd1',
);

const cometUSDCPool = "0xF09F0369aB0a875254fB565E52226c88f10Bc839";
const compoundUSDC = "0xDB3cB4f2688daAB3BFf59C24cC42D4B6285828e9";

const aavePool = "0xcC6114B983E4Ed2737E9BD3961c9924e6216c704";
const aaveUSDC = "0x52d800ca262522580cebad275395ca6e7598c014"

export async function fetchAaveBalance(address) {

  // View contract used to fetch all reserves data (including market base currency data), and user reserves
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: markets.AaveV3Mumbai.UI_POOL_DATA_PROVIDER,
    provider,
    chainId: ChainId.mumbai,
  });

  // View contract used to fetch all reserve incentives (APRs), and user incentives
  const incentiveDataProviderContract = new UiIncentiveDataProvider({
    uiIncentiveDataProviderAddress:
    markets.AaveV3Mumbai.UI_INCENTIVE_DATA_PROVIDER,
    provider,
    chainId: ChainId.mumbai,
  });

  let usdcInfo;
  const reserves = await poolDataProviderContract.getReservesHumanized({
    lendingPoolAddressProvider: markets.AaveV3Mumbai.POOL_ADDRESSES_PROVIDER,
  });
  
  const userReserves = await poolDataProviderContract.getUserReservesHumanized({
    lendingPoolAddressProvider: markets.AaveV3Mumbai.POOL_ADDRESSES_PROVIDER,
    user: address,
  });

  // Array of incentive tokens with price feed and emission APR
  const reserveIncentives =
    await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
      lendingPoolAddressProvider:
        markets.AaveV3Mumbai.POOL_ADDRESSES_PROVIDER,
    });

  // Dictionary of claimable user incentives
  const userIncentives =
    await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
      lendingPoolAddressProvider:
        markets.AaveV3Mumbai.POOL_ADDRESSES_PROVIDER,
      user: address,
    });

  const reservesArray = reserves.reservesData;  
  const baseCurrencyData = reserves.baseCurrencyData;
  const userReservesArray = userReserves.userReserves;
  
  const currentTimestamp = dayjs().unix();

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
  userSummary.userReservesData.map(reserve=>{
    if(reserve.underlyingAsset==aaveUSDC){
        usdcInfo = reserve;
    }
  })
  return [usdcInfo.underlyingBalance,usdcInfo.underlyingBalanceUSD];
}

export async function fetchCompoundBalance(address){
    const cometAbi = [
        'function balanceOf(address account) returns (uint256)',
    ];
    const comet = new ethers.Contract(cometUSDCPool,cometAbi,provider);
    const response = await comet.callStatic.balanceOf(address);
    const balance = ethers.utils.formatUnits(response,6);
    return balance;
}
