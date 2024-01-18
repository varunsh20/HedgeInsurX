import { Pool,Position, NonfungiblePositionManager ,nearestUsableTick} from '@uniswap/v3-sdk'
import { Token,Percent } from '@uniswap/sdk-core'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { ethers } from 'ethers';

const chainId = 80001;
const token0 = import.meta.env.VITE_AAVE_USDC;
const token1 = import.meta.env.VITE_AAVE_USDT;
const currentPoolAddress = import.meta.env.VITE_USDC_USDT_AAVE;

const RPC_URL =  import.meta.env.VITE_RPC_URL;
const nfpManager =  import.meta.env.VITE_NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS;

const rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);

const poolFee = 3000;
const MAX_FEE_PER_GAS = '100000000000';
const MAX_PRIORITY_FEE_PER_GAS = '100000000000';

const erc20ABI = [
    'function approve(address spender, uint amount) returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)'
];


const tokenA = new Token(chainId,token0,6,"USDC","USDC");
const tokenB = new Token(chainId,token1,6,"USDT ","USDT ");

export default async function MintLiquidity(signer,amount0,amount1){
    const user = await signer.getAddress();
    const token0allowance = await getTokenAllowance(user,token0);
    const token1allowance = await getTokenAllowance(user,token1);
    if(parseInt(amount0)>parseInt(token0allowance)){
        const txs = await getTokenTransferApproval(token0,ethers.constants.MaxUint256,nfpManager,signer);
        await txs.wait();
    }
    if(parseInt(amount1)>parseInt(token1allowance)){
        const txs = await getTokenTransferApproval(token1,ethers.constants.MaxUint256,nfpManager,signer);
        await txs.wait();
    }
    const poolContract = new ethers.Contract(currentPoolAddress,IUniswapV3PoolABI.abi,rpcProvider);  
    const [liquidity, slot0] = await Promise.all([poolContract.liquidity(),poolContract.slot0(),]);
    const configuredPool = new Pool(tokenA,tokenB,poolFee,slot0.sqrtPriceX96.toString(),liquidity.toString(),slot0.tick);
    const position = Position.fromAmounts({pool: configuredPool,
        tickLower:
          nearestUsableTick(configuredPool.tickCurrent, configuredPool.tickSpacing) -
          configuredPool.tickSpacing * 2,
        tickUpper:
          nearestUsableTick(configuredPool.tickCurrent, configuredPool.tickSpacing) +
          configuredPool.tickSpacing * 2,
        amount0: amount0,
        amount1: amount1,
        useFullPrecision: true,
    })

    const mintOptions = {recipient: user,deadline: Math.floor(Date.now() / 1000) + 60 * 20,
        slippageTolerance: new Percent(50, 10_000),
    }
      
    // get calldata for minting a position
    const { calldata, value } = NonfungiblePositionManager.addCallParameters(position,mintOptions);
    const transaction = {
        data: calldata,
        to: nfpManager,
        value: value,
        from: user,
        maxFeePerGas: MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
    };
    const txRes = await signer.sendTransaction(transaction);
   
}

async function getTokenTransferApproval(tokenAddress,amount,address,signer) {
    const tokenContract = new ethers.Contract(tokenAddress,erc20ABI,signer);
    return tokenContract.approve(address,amount);
}

async function getTokenAllowance(user,tokenAddress){
    const tokenContract = new ethers.Contract(tokenAddress,erc20ABI,rpcProvider);
    const allowance = await tokenContract.allowance(user,nfpManager);
    return allowance
}