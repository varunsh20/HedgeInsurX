import LeftPanel from "./LeftPanel";
import { Flex,Box,Text,HStack,VStack,List,TabList, Tab, Tabs,TabIndicator,
TabPanel, TabPanels, Input,InputGroup,InputLeftElement,InputRightElement,Button,Image,Tag, Spinner,Center} from "@chakra-ui/react";
import { useLocation}  from "react-router-dom";
import { useState,useEffect } from "react";
import {ethers} from "ethers";
import { useAddress } from "@thirdweb-dev/react";
import StrategyAbi from '../../../../contracts/hardhat/artifacts/contracts/Strategy.sol/Strategy.json';
import {fetchAaveBalance, fetchCompoundBalance} from "../../context/LendingProtocols/BalanceInfo";
import MintLiquidity from "../../context/DEX's/MintingLiquidity";
import { ToastContainer, toast } from 'react-toastify';
import PositionInfo from "../../context/DEX's/PositionInfo";
import RemoveLiquidity from "../../context/DEX's/RemovingLiquidity";

export default function Strategies(){
    
    const strategyData = useLocation();
    const [depositValue, setValue] = useState('')
    const [fundsDeposited,setFundsDeposited] = useState();
    const [withdrawnAmount, setWithdrawnAmount] = useState('');
    const [balance, setBalance] = useState();
    const [liquidityProvided,setLiquidityProvided] = useState();
    const handleDeposit = (event) => setValue(event.target.value);
    const handleWithdraw = (event) => setWithdrawnAmount(event.target.value);
    const img = import.meta.env.VITE_TOKEN_LOGO;

    const RPC_URL =  import.meta.env.VITE_RPC_URL;
    const cometUSDCPool = import.meta.env.VITE_COMET_USDC;
    const aavePool = import.meta.env.VITE_AAVE_POOL;
    const aaveUSDT = import.meta.env.VITE_AAVE_USDT;
    const strategyPool = import.meta.env.VITE_STRATEGY;
    const privateKey = import.meta.env.VITE_PRIVATE_KEY;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const wallet = new ethers.Wallet(privateKey,rpcProvider);
    const user = useAddress();


    const cometAbi = [
        'event Supply(address indexed from, address indexed dst, uint256 amount)',
        'function supply(address asset, uint amount)',
        'function withdraw(address asset, uint amount)',
        'function balanceOf(address account) returns (uint256)',
        'function borrowBalanceOf(address account) returns (uint256)',
        'function collateralBalanceOf(address account, address asset) external view returns (uint128)',
    ];

    const aavePoolAbi = [
        'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
        'function withdraw(address asset,uint256 amount,address to) public virtual override returns (uint256)',
        'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
        'function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf)',
        'function getUserAccountData(address user) external view virtual override returns (uint256 totalCollateralBase,uint256 totalDebtBase,uint256 availableBorrowsBase,uint256 currentLiquidationThreshold,uint256 ltv,uint256 healthFactor)',
    ];

    const erc20ABI = [
        'function approve(address spender, uint amount) returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)'
    ];

    const id = (strategyData.state.id-1).toString();
    const assetAddress = strategyData.state.assetAddress;
    const usdcContract = new ethers.Contract(assetAddress,erc20ABI,provider.getSigner());
    const usdcReadContract = new ethers.Contract(assetAddress,erc20ABI,rpcProvider);

    useEffect(()=>{
        async function getUserBalanceInfo(){
            const accounts = await window.ethereum.request({method:'eth_accounts'});
            const user = accounts[0];
            if(user==null){
                setBalance("0.0");
                setFundsDeposited("0.0");
            }
            const strategyContractRead = new ethers.Contract(strategyPool,StrategyAbi.abi,rpcProvider);
            const response = await strategyContractRead.getUserFunds(user,id);
            const usersFunds = ethers.utils.formatUnits(response.toString(),6);
            setFundsDeposited(usersFunds);

            if(id=="0"){
                if(strategyData.state.pool==cometUSDCPool){
                    const bal = await fetchCompoundBalance(user).catch((error) => {
                        console.error('Error retrieving balance info rate:', error);
                        setBalance(0);
                      });
                    setBalance(bal);
                }
                else if(strategyData.state.pool==aavePool){
                    const bal = await fetchAaveBalance(user).catch((error) => {
                        console.error('Error retrieving balance info rate:', error);
                      });
                    setBalance(bal[0]);
                }
            }
            else if(id=="1"){
                const bal = await fetchAaveBalance(user).catch((error) => {
                    console.error('Error retrieving balance info rate:', error);
                    setBalance(0);
                  });

                //fetching position info of user. 2nd and 3rd index represents balance of both tokens 
                //deposited in the position
                const pos = await PositionInfo(user);
                const amnt = parseFloat(pos[2])+parseFloat(pos[3]);
                setLiquidityProvided(amnt);
                const totalBalance = parseFloat(bal[0])+amnt;
                setBalance(totalBalance.toFixed(2));
            }
        }
        getUserBalanceInfo();
    },[balance])

    function setMaxBalance(){
        setWithdrawnAmount(parseFloat(balance));
    }

    async function Stake(){
        const strategyContract = new ethers.Contract(strategyPool,StrategyAbi.abi,provider.getSigner());
        if(user==null){
            toast.error("Please Connect Your Wallet.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else if(depositValue==""){
            toast.info("Minimum Amount is 2 USDC.", {
                position: toast.POSITION.TOP_CENTER
            });
        }

        else{
            //calculating fees amount and actual amount in wei to be supplied
            const fees = depositValue*(strategyData.state.fees);
            const feesInWei = new ethers.utils.parseUnits(fees.toString(),6);
            const amountAfterFees = depositValue-fees;
            const amount = new ethers.utils.parseUnits(amountAfterFees.toString(),6);

            //making allowance and supply tx's
            const strategyContractAllowance = await usdcReadContract.allowance(user,strategyPool);
            if(parseInt(feesInWei)>parseInt(strategyContractAllowance)){
                const txs = await usdcContract.approve(strategyPool,ethers.constants.MaxUint256);
                await txs.wait();
            }

            //deducted fees goes to strategy contract
            const feeTx = await strategyContract.deductFees(id,assetAddress,feesInWei,amount);
            await feeTx.wait();

            if(id=="0"){
            
                if(strategyData.state.pool==aavePool){
                    await supplyToProtocol(aavePool,aavePoolAbi,amount);
                }
                else if(strategyData.state.pool==cometUSDCPool){
                    await supplyToProtocol(cometUSDCPool,cometAbi,amount);
                }
            }

            else if(id=="1"){
                const amount0 = amountAfterFees/2;  //USDC
                const collateralAmount = amountAfterFees-amount0;  //USDC to be collateralized for borrowing USDT
                const amountInWei0 = new ethers.utils.parseUnits(amount0.toString(),6);
                const collateralWei = ethers.utils.parseUnits(collateralAmount.toString(),6);
                await supplyToProtocol(aavePool,aavePoolAbi,collateralWei);
                const userAccountInfo = await getUserAccountInfo(user);
                const amountToBorrow = userAccountInfo.availableBorrowsBase;
                await borrowFromProtocol(amountToBorrow,aavePool,aavePoolAbi);
                await MintLiquidity(provider.getSigner(),amountInWei0,amountToBorrow);
            }
        }
    }

    async function supplyToProtocol(protocolAddress,protocolAbi,amount){
        const lendingPool = new ethers.Contract(protocolAddress,protocolAbi,provider.getSigner());
        const givenAllowanceWei = await usdcReadContract.allowance(user,lendingPool.address);
        if(parseInt(amount)>parseInt(givenAllowanceWei)){
            const txs = await usdcContract.approve(lendingPool.address,ethers.constants.MaxUint256);
            await txs.wait();
        }
        if(protocolAddress==aavePool){
            const tx = await lendingPool.supply(assetAddress,amount,user,0);
            await tx.wait();
        }
        else{
            const tx = await lendingPool.supply(assetAddress, amount);
            await tx.wait();
        }
    }

    async function borrowFromProtocol(amount,protocolAddress,protocolAbi){
        const lendingPool = new ethers.Contract(protocolAddress,protocolAbi,provider.getSigner());
        const usdtContract = new ethers.Contract(aaveUSDT,erc20ABI,provider.getSigner());
        const usdtReadContract = new ethers.Contract(aaveUSDT,erc20ABI,rpcProvider);
        const givenAllowance = await usdtReadContract.allowance(user,lendingPool.address);

        //if(parseInt(amount)>parseInt(givenAllowance)){
            const txs = await usdtContract.approve(lendingPool.address,ethers.constants.MaxUint256);
            await txs.wait();
        //}
        const tx = await lendingPool.borrow(usdtContract,amount,2,0,user);
        await tx.wait();
    }

    async function withdrawFromProtocol(assetAddress,amountWei,user){
        if(strategyData.state.pool==aavePool){
            const lendingPool = new ethers.Contract(aavePool,aavePoolAbi,provider.getSigner());
            const tx = await lendingPool.withdraw(assetAddress,amountWei,user);
            await tx.wait();
        }
        else if(strategyData.state.pool==cometUSDCPool){
            const lendingPool = new ethers.Contract(cometUSDCPool,cometAbi,provider.getSigner());
            const tx = await lendingPool.withdraw(assetAddress,amountWei);
            await tx.wait();
        }
    }

    async function Withdraw(){
        // const accounts = await window.ethereum.request({method:'eth_accounts'});
        // const user = accounts[0];s
        if(user==null){
            toast.error("Please Connect Your Wallet.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else{
            if(id=="0"){
                if(withdrawnAmount>parseFloat(balance)){
                    toast.error("Invalid Withdrawn Amount.", {
                        position: toast.POSITION.TOP_CENTER
                    });
                }
                else if(withdrawnAmount==""){
                    toast.info("Invalid Withdrawn Amount.", {
                        position: toast.POSITION.TOP_CENTER
                    });
                }
                else{
                    await withdrawFromStrategy(withdrawnAmount);
                    const amountWei = ethers.utils.parseUnits(withdrawnAmount.toString(),6);
                    await withdrawFromProtocol(assetAddress,amountWei,user);
                }
            }
            else if(id=="1"){
                await withdrawFromStrategy(liquidityProvided);
                const amountWei = ethers.utils.parseUnits(liquidityProvided.toString(),6);
                const pos = await PositionInfo(user);
                const userAccountInfo = await getUserAccountInfo(user);
                const lendingPool = new ethers.Contract(aavePool,aavePoolAbi,provider.getSigner());
                await RemoveLiquidity(provider.getSigner(),pos);
                const tx = await lendingPool.repay(assetAddress,userAccountInfo.totalDebtBase,2,user);
                await tx.wait();
                await withdrawFromProtocol(assetAddress,amountWei,user);
            }
        }
    }

    async function withdrawFromStrategy(withdrawnAmount){
        if(withdrawnAmount>fundsDeposited){
            toast.error("Withdrawn Amount Exceeds Deposited Balance.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        const amountWei = ethers.utils.parseUnits(withdrawnAmount.toString(),6);
        const strategyContract = new ethers.Contract(strategyPool,StrategyAbi.abi,wallet);
        const functionName = 'withdraw';
        const functionParams = [id,amountWei,user];
        const functionData = strategyContract.interface.encodeFunctionData(functionName, functionParams);
        const tx = await wallet.sendTransaction({to: strategyPool,data: functionData,});
        await tx.wait();
    }

    async function getUserAccountInfo(user){
        const lendingPool = new ethers.Contract(strategyData.state.pool,aavePoolAbi,rpcProvider);
        const res = await lendingPool.callStatic.getUserAccountData(user);
        const availableBorrowsBase = res.availableBorrowsBase;
        const totalDebtBase = res.totalDebtBase;
        const totalCollateralBase = res.totalCollateralBase;
        return {availableBorrowsBase,totalDebtBase,totalCollateralBase};
    };

    return(
        <Flex w = "100%" pl="10">
        <LeftPanel/>
        <Box ml = {270} pt={2} pl={10} w="100%" mt="120px">
            <Flex w="100%" alignItems={"flex-start"}>
                <Box w="100%" >
                <Flex mt={6} flexDirection={"column"}>
                    <HStack spacing={4}>
                    <Tag size="lg" w="fit-content" variant='solid' colorScheme='teal' display='flex'
                     justifyContent={"center"}>New!</Tag>
                    <Tag size="lg" w="fit-content" variant='solid' colorScheme='messenger' display='flex' justifyContent={"center"}>
                        {strategyData.state.risk} Risk</Tag>
                    <Tag size="lg" w="fit-content" variant='solid' colorScheme='red' display='flex' justifyContent={"center"}>
                        Mumbai</Tag>
                    </HStack>
                    <Text fontWeight="bold" fontSize="40px" >{strategyData.state.name} </Text>
                    <Box mt={10} w="100%" display={"flex"} flexDirection={"row"}>
                            <Flex>
                                <List>
                                <Text fontSize={"24px"} fontWeight={"500"}>APY - </Text>
                                <Text fontSize={"30px"} fontWeight={"600"}>{strategyData.state.stratApy.toFixed(2)}%</Text>
                                </List>
                            </Flex>
                            <Flex ml ="auto">
                                <List>
                                <Text fontSize={"24px"} fontWeight={"500"}>Fees - </Text>
                                <Text fontSize={"30px"} fontWeight={"600"}>{strategyData.state.fees*100}%</Text>
                                </List>
                            </Flex>
                            <Flex ml="auto">
                                <List>
                                <Text fontSize={"24px"} fontWeight={"500"}>AUM - </Text>
                                <Flex display={"flex"} flexDirection={"row"} alignItems={"center"}>
                                <Image w="10%" h="10%" src={img} alignItems={"center"} alt="USDC"  mr="2px"/>
                                <Text fontSize={"30px"} fontWeight={"600"} pl="8px">
                                {strategyData.state.aum}
                                </Text>
                                </Flex>
                                </List>
                            </Flex>
                    </Box>
                    <Box mt={20}>
                        <List w="100%">
                        <Text fontSize={"35px"} fontWeight={"600"} textDecoration={"underline"}>An Overview :</Text>
                        <Text fontSize={"24px"} mt={8} textAlign={"justify"}
                         mb={10}>{strategyData.state.content}
                        </Text>
                        </List>
                    </Box>
                </Flex> 
                </Box>
            <Box w="85%" mt={18} ml={50}>
            {!balance?<Center><Spinner size='xl' alignItems="center" justifyContent="center"/></Center>:
                 <Box w="85%" mt={18} ml={50}>
                <HStack h={"fit-content"} w="100%" bg="rgba(21, 34, 57, 0.6)" borderRadius={"25px"} pl="20px" 
                    spacing='10px' mb={10}  border="solid 0.9px #253350"  zIndex={2}
                    _hover={{boxShadow:'0px 0px 10px 0.2px #5684db'}} >
                        <Box p ="10px">
                            <HStack gap={10}>
                                <Text fontSize={"24px"} w="50%">
                                    My Shares : 
                                </Text>
                                <Box display="flex" alignItems={"center"} w="50%" ml={20}>
                                    <Image w="14%" src={img} alignItems={"center"} alt="USDC"  mr="1px"/>
                                    <Text fontSize={"23px"} ml="11px"> {parseFloat(balance).toFixed(2)}</Text>
                                </Box>
                            </HStack>
                            <HStack mt = "10px" gap={10}>
                                <Text fontSize={"24px"} w="50%">
                                    Funds Deposited : 
                                </Text>
                                <Box display="flex" alignItems={"center"} w="50%" ml={20}>
                                    <Image w="14%" src={img} alignItems={"center"} alt="USDC" mr="1px"/>
                                    <Text fontSize={"23px"} ml="11px">{parseFloat(fundsDeposited).toFixed(2)}</Text>
                                </Box>
                            </HStack>
                            <HStack mt="10px" gap={10}>
                                <Text fontSize={"24px"} w="50%">
                                    PnL : 
                                </Text>
                                <Box display="flex" alignItems={"center"} w="50%" ml={20}>
                                    <Image w="14%" src={img} alignItems={"center"} alt="USDC" mr="1px"/>
                                    {parseFloat(balance).toFixed(2)-parseFloat(fundsDeposited).toFixed(2)>0?
                                    <Text fontSize={"23px"} ml="11px" color="#35fc35">{parseFloat(balance).toFixed(2)-parseFloat(fundsDeposited).toFixed(2)}</Text>:
                                    <Text fontSize={"23px"} ml="11px" color="#ff5454">{parseFloat(balance).toFixed(2)-parseFloat(fundsDeposited).toFixed(2)}</Text>
                                    }
                                </Box>
                            </HStack>
                        </Box>
                </HStack>

                <Box h="58vh" w="100%" pt={2} pb={4} top={10} bg="rgba(21, 34, 57, 0.6)"
                border="solid 0.9px #253350" borderRadius={"25px"}  zIndex={2} mb="15px"
                _hover={{boxShadow:'0px 0px 10px 0.2px #5684db'}}>
                    <Box pt={"10px"} pl ={5} pr={5}>
                    <Tabs  align="center" variant="unstyled" isFitted>
                        <TabList >
                        <Tab fontSize="22px" fontWeight="500"> DEPOSIT</Tab>
                        <Tab fontSize="22px" fontWeight="500"> WITHDRAW</Tab>
                        </TabList>
                        <TabIndicator mt="-1.5px" height="2px" bg="#5684db" borderRadius="1px"/>
                        <TabPanels>
                            <TabPanel >
                                <Box mt={5}>
                                    <Box display={"flex"} alignItems={"flex-start"} mb={"5px"}>
                                        <Text fontSize={"24px"} pl= "2px">Pay Amount :</Text>
                                    </Box>
                                    <InputGroup>
                                    <InputLeftElement pointerEvents='none' top="9px" left="15px" alt="USDC"  display={"flex"} 
                                    justifyContent={"center"} >
                                    <Flex >
                                        <Image src={img} alignItems={"center"} alt="USDC"/>
                                    </Flex>
                                    </InputLeftElement>
                                        <Input pl="68px" h = {"60px"} placeholder="0" size='lg' bg="rgb(93 132 202 / 60%)"
                                        fontSize={"30px"} value={depositValue} onChange={handleDeposit} type="number" required={true}/>
                                    </InputGroup>

                                    <Box display={"flex"} alignItems={"flex-start"} mb={"5px"}>
                                        <Text fontSize={"24px"} pl= "2px" mt={10}>Receive Shares (Approx) :</Text>
                                    </Box>
                                    <InputGroup>
                                    <InputLeftElement pointerEvents='none' top="9px" left="15px" right="15px" alt="USDC"  display={"flex"} 
                                    justifyContent={"center"} >
                                    <Flex >
                                        <Image src={img} alignItems={"center"} alt="HIX"/>
                                    </Flex>
                                    </InputLeftElement>
                                        <Input pl="68px" h = {"60px"} placeholder={depositValue-(depositValue*(strategyData.state.fees))}  _placeholder={{ opacity: 1, color: 'white' }} size='lg' bg="rgb(93 132 202 / 60%)"
                                        fontSize={"30px"}  readOnly/>
                                    </InputGroup>
                                </Box>
                                <Box mt={"50px"}>
                                    <Button w="100%" h="60px" fontSize={"24px"} color={"white"} 
                                    bgColor={"#ea6969"}  _hover={{ bgColor:"#d43b3b", 
                                     cursor:"pointer"}}  onClick={()=>Stake()}>
                                        Stake
                                    </Button>
                                </Box>
                            </TabPanel>
                            <TabPanel>
                            <Box mt={5}>
                                    <Box display={"flex"} alignItems={"flex-start"} mb={"5px"}>
                                        <Text fontSize={"24px"} pl= "2px">Withdraw Amount :</Text>
                                    </Box>
                                    {id==0?
                                    <InputGroup>
                                    <InputLeftElement pointerEvents='none' top="9px" left="15px" alt="USDC"  display={"flex"} 
                                    justifyContent={"center"} >
                                    <Flex >
                                        <Image src={img} alignItems={"center"} alt="USDC"/>
                                    </Flex>
                                    </InputLeftElement>
                                    <Input pl="68px" h = {"60px"} placeholder="0"  _placeholder={{ opacity: 1, color: 'white' }} size='lg' bg="rgb(93 132 202 / 60%)"
                                        fontSize={"30px"} value={withdrawnAmount} onChange={handleWithdraw} type="number" required={true}/>
                                    <InputRightElement width='4.5rem' top="9px" >
                                    <Button size='sm' onClick={()=>setMaxBalance()}>
                                        Max
                                    </Button>
                                    </InputRightElement>
                                    </InputGroup>:<></>}
                                    <Box mt={"50px"}>
                                    <Button w="100%" h="60px" fontSize={"24px"} color={"white"} 
                                    bgColor={"#ea6969"}  _hover={{ bgColor:"#d43b3b", 
                                     cursor:"pointer"}}  onClick={()=>Withdraw()}>
                                        Withdraw
                                    </Button>
                                </Box>
                            </Box>

                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                    </Box>
                </Box>
                </Box>
            }
            </Box>
            </Flex>
        </Box>
        <ToastContainer/>
        </Flex>
    )
}