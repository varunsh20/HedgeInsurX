import { ethers } from 'ethers';
import {UiPoolDataProvider,UiIncentiveDataProvider,ChainId} from '@aave/contract-helpers';
import * as markets from '@bgd-labs/aave-address-book';
import { formatUserSummaryAndIncentives,formatReserves} from '@aave/math-utils';
import dayjs from 'dayjs';
import Compound from '@compound-finance/compound-js';

const provider = new ethers.providers.JsonRpcProvider(
  'https://eth-sepolia.g.alchemy.com/v2/FfIrwZNdy3_kn4I-0emMBuuPRR0lRhwq',
);

const cometUSDCPool = "0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e";
const compoundUSDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

const aavePool = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
const aaveUSDC = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"

export async function fetchAaveBalance(address) {

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
