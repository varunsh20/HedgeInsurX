import { ethers } from "ethers";
import { Pool,Position, NonfungiblePositionManager ,nearestUsableTick} from '@uniswap/v3-sdk';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { Token, Percent,CurrencyAmount} from '@uniswap/sdk-core';
import { JSBI } from "@uniswap/sdk";

const chainId = 11155111;
const token0 = import.meta.env.VITE_AAVE_USDC;
const token1 = import.meta.env.VITE_AAVE_USDT;
const currentPoolAddress = import.meta.env.VITE_USDC_USDT_AAVE;

const RPC_URL =  import.meta.env.VITE_RPC_URL;
const nfpManager =  import.meta.env.VITE_NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS;

const rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
const poolFee = 3000;
const MAX_FEE_PER_GAS = '100000000000';
const MAX_PRIORITY_FEE_PER_GAS = '100000000000';

const fractionToRemove = 1;

const tokenA = new Token(chainId,token0,6,"USDC","USDC");
const tokenB = new Token(chainId,token1,6,"USDT ","USDT");
const poolContract = new ethers.Contract(currentPoolAddress,IUniswapV3PoolABI.abi,rpcProvider);  

export default async function RemoveLiquidity(signer,position){
	const user = await signer.getAddress();
    const [liquidity, slot0] = await Promise.all([poolContract.liquidity(),poolContract.slot0(),]);
	const amount0Decrease = fromReadableAmount(position[2] * fractionToRemove, tokenA.decimals);
	const amount1Decrease = fromReadableAmount(position[3] * fractionToRemove, tokenB.decimals);
	const currentPosition = constructPosition(amount0Decrease,amount1Decrease,slot0,liquidity.toString());
	const collectOptions = {
		tokenId: parseInt(position[0]),
		expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
		  tokenA,
		  JSBI.BigInt(position[1].tokensOwed0)
		),
		expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
		  tokenB,
		  JSBI.BigInt(position[1].tokensOwed1)
		),
		recipient: user,
	  }
	const removeLiquidityOptions = {
		deadline: Math.floor(Date.now() / 1000) + 60 * 20,
		slippageTolerance: new Percent(50, 10_000),
		tokenId: parseInt(position[0]),
		// percentage of liquidity to remove
		liquidityPercentage: new Percent(1),
		collectOptions,
	};
	const { calldata, value } = NonfungiblePositionManager.removeCallParameters(
		currentPosition,
		removeLiquidityOptions
	);
	const transaction = {
		data: calldata,
		to: nfpManager,
		value: value,
		from: user,
		maxFeePerGas: MAX_FEE_PER_GAS,
		maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
	}

	const txRes = await signer.sendTransaction(transaction);
}

function constructPosition(amount0,amount1,slot0,liquidity) {

	const configuredPool = new Pool(tokenA,tokenB,poolFee,slot0.sqrtPriceX96.toString(),liquidity.toString(),slot0.tick);

    // create position using the maximum liquidity from input amounts
    return Position.fromAmounts({
        pool: configuredPool,
        tickLower:
            nearestUsableTick(configuredPool.tickCurrent, configuredPool.tickSpacing) -
            configuredPool.tickSpacing * 2,
        tickUpper:
            nearestUsableTick(configuredPool.tickCurrent, configuredPool.tickSpacing) +
            configuredPool.tickSpacing * 2,
        amount0,
        amount1,
        useFullPrecision: true,
    })
}

function fromReadableAmount(amount, decimals){
	const extraDigits = Math.pow(10, countDecimals(amount))
	const adjustedAmount = amount * extraDigits
	return JSBI.divide(
	  JSBI.multiply(
		JSBI.BigInt(adjustedAmount),
		JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
	  ),
	  JSBI.BigInt(extraDigits)
	)
};
function countDecimals(x) {
	if (Math.floor(x) === x) {
	  return 0
	}
	return x.toString().split('.')[1].length || 0
  }
