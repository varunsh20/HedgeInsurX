import { ethers } from "ethers";
import INONFUNGIBLE_POSITION_MANAGER from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { JSBI } from "@uniswap/sdk";


const currentPoolAddress = import.meta.env.VITE_USDC_DAI_AAVE;

const RPC_URL =  import.meta.env.VITE_RPC_URL;
const nfpManager =  import.meta.env.VITE_NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS;
const rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
const poolContract = new ethers.Contract(currentPoolAddress,IUniswapV3PoolABI.abi,rpcProvider);  
const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

export default async function PositionInfo(user){

    const nfpmContract = new ethers.Contract(nfpManager,INONFUNGIBLE_POSITION_MANAGER.abi,rpcProvider);

    //const numPositions = await nfpmContract.balanceOf(user);
    const positionId = await nfpmContract.tokenOfOwnerByIndex(user, 0);
    const position  = await nfpmContract.positions(positionId);
    const [liquidity, slot0] = await Promise.all([poolContract.liquidity(),poolContract.slot0(),]);
    const [amount0,amount1] = await getTokenAmounts(parseInt(position.liquidity),slot0.sqrtPriceX96,position.tickLower,position.tickUpper,6,6);
    return [positionId,position,amount0,amount1];
}

export async function getTokenAmounts(liquidity,sqrtPriceX96,tickLow,tickHigh,Decimal0,Decimal1){
	let sqrtRatioA = Math.sqrt(1.0001**tickLow);
	let sqrtRatioB = Math.sqrt(1.0001**tickHigh);
	let currentTick = getTickAtSqrtPrice(sqrtPriceX96);
    let sqrtPrice = sqrtPriceX96 / Q96;
	let amount0 = 0;
	let amount1 = 0;
	if(currentTick < tickLow){
		amount0 = Math.floor(liquidity*((sqrtRatioB-sqrtRatioA)/(sqrtRatioA*sqrtRatioB)));
	}
	else if(currentTick >= tickHigh){
		amount1 = Math.floor(liquidity*(sqrtRatioB-sqrtRatioA));
	}
	else if(currentTick >= tickLow && currentTick < tickHigh){ 
		amount0 = Math.floor(liquidity*((sqrtRatioB-sqrtPrice)/(sqrtPrice*sqrtRatioB)));
		amount1 = Math.floor(liquidity*(sqrtPrice-sqrtRatioA));
	}

	let amount0Human = (amount0/(10**Decimal0)).toFixed(Decimal0);
	let amount1Human = (amount1/(10**Decimal1)).toFixed(Decimal1);
	return [amount0Human, amount1Human]
}

function getTickAtSqrtPrice(sqrtPriceX96){
	let tick = Math.floor(Math.log((sqrtPriceX96/Q96)**2)/Math.log(1.0001));
	return tick;
}