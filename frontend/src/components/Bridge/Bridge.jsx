import {Box,Flex,HStack,Button,Select,Text,Image,Icon,Input,InputGroup,InputLeftElement} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import chainLists from "../../chainLists.json";
import { useState} from 'react';
import {useSwitchChain } from "@thirdweb-dev/react";
import { ToastContainer, toast } from 'react-toastify';
import CCIPTut from '../../../../contracts/hardhat/artifacts/contracts/CCIPTut.sol/CCIPTut.json';
import { ethers } from 'ethers';

export default function Bridge(){

    const [sourceChainAddress, setSourceChainAddress] = useState();
    const [destinationChainSelector, setDestinationChainSelector] = useState();
    const [amount,setAmount] = useState();
    const [recAddress,setRecAddress] = useState();
    const [assetAddress,setAssetAddress] = useState();
    const switchChain = useSwitchChain();

    const tokenLogo = import.meta.env.VITE_CCIP_TOKEN;
    const RPC_URL =  import.meta.env.VITE_RPC_URL;
    const privateKey = import.meta.env.VITE_PRIVATE_KEY;

    const handleDeposit = (event)=>setAmount(event.target.value);
    const handleAddress = (event)=>setRecAddress(event.target.value);
    
    const handleSourceChain = (event) => {
        const [routerAddress,tokenAddress,chainId] = event.target.value.split(",");
        setSourceChainAddress(routerAddress);
        setAssetAddress(tokenAddress);
        switchChain(parseInt(chainId));

    }

    const handleDestinationChain = (event) => setDestinationChainSelector(event.target.value);

    const erc20ABI = [
        'function approve(address spender, uint amount) returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)',
        'function transfer(address to, uint256 value) public virtual returns (bool)'
    ];

    const rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey,rpcProvider);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    

    async function BridgeAssets(){
        const accounts = await window.ethereum.request({method:'eth_accounts'});
        const user = accounts[0];
        if(user==null){
            toast.error("Please Connect Your Wallet.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else if(sourceChainAddress==null){
            toast.info("Please Select Your Source Chain.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else if(destinationChainSelector==null){
            toast.info("Please Select Your Destination Chain.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else if(recAddress==null){
            toast.info("Recipient Address Not Provided.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else{
            const assetContract = new ethers.Contract(assetAddress,erc20ABI,provider.getSigner());
            const ccipContract = new ethers.Contract(sourceChainAddress,CCIPTut.abi,provider.getSigner());
            const amountWei = ethers.utils.parseEther(amount.toString());

            //transferring tokens to ccip's owner address;
            const transferTx = await assetContract.transfer(sourceChainAddress,amountWei);
            await transferTx.wait();

            //owner of ccip address bridging assets
            const functionName = 'transferTokensPayLINK';
            const functionParams = [destinationChainSelector,recAddress,assetAddress,amountWei];
            const functionData = ccipContract.interface.encodeFunctionData(functionName, functionParams);
            const bridgeTx = await wallet.sendTransaction({to: sourceChainAddress,data: functionData,});
            await bridgeTx.wait();
        }
    }
    return(
        <>
        <Box pt={44} mb={10}>
            <Flex  pr={"20"} alignItems={"center"} justifyContent={"center"} mr={"auto"}>
                <Box mt={50} h="68vh" w="40%" pt={2} pb={4}  bg="rgba(21, 34, 57, 0.6)"  boxShadow={ '0px 0px 10px 0.2px #5684db'}
                border="solid 0.9px #253350" borderRadius={"25px"}  zIndex={2} mb="15px">
                    <HStack p="35px" gap={10} w="100%" >
                        <Box >
                            <Text fontSize={"24px"}>
                                From
                            </Text>
                            <Select  bg="#4c689d" fontSize={"20px"} top={2} w="100%" size='lg' border={"none"} 
                             _hover={{ bg:"#5684db",cursor:"pointer"}}
                             onChange={handleSourceChain}>
                                <option selected hidden disabled value="">Source Chain</option>
                                {chainLists.map((chain)=>(
                                     <option value={[chain.address,chain.ccipBnmToken,chain.chainId]} style={{ background: "#4c689d" ,fontSize:"20px"}}><Image src={tokenLogo} alt="USDC"></Image>{chain.name}</option>
                                ))}
                            </Select>
                        </Box>
                        <Box display={"flex"}  ml="auto" mt={12}>
                            <Button bg="#4c689d"  _hover={{ bg:"#5684db",cursor:"pointer"}} color={"white"}>
                            <Icon as = {ArrowForwardIcon}  w={6} h={12} ></Icon>
                            </Button>
                        </Box>
                        <Box ml="auto" mr="18px">
                            <Text  fontSize={"24px"} mr="40px">
                                To
                            </Text>
                            <Select  border={"none"}  background="#4c689d" fontSize={"20px"} top={2}
                             size='lg' w="100%" _hover={{ bg:"#5684db",cursor:"pointer"}}
                             onChange={handleDestinationChain}>
                                <option selected hidden disabled value="">Destination Chain</option>
                                {chainLists.map((chain)=>(
                                    <option value={chain.chainSelector} style={{ background: "#4c689d" ,fontSize:"20px"}}><Image src={tokenLogo} borderRadius={"25px"}  w="60%" h = "50px" alt="USDC"></Image>{chain.name}</option>
                                ))}
                            </Select>
                        </Box>
                    </HStack>
                    <Box mt={2} p="35px">
                        <Box display={"flex"} alignItems={"flex-start"} mb={"5px"}>
                            <Text fontSize={"24px"} pl= "2px">Send Amount :</Text>
                        </Box>
                        <InputGroup>
                        <InputLeftElement pointerEvents='none' top="9px" left="15px" alt="USDC"  display={"flex"} 
                        justifyContent={"center"} >
                            <Flex >
                                <Image src={tokenLogo} alignItems={"center"} alt="USDC"/>
                            </Flex>
                        </InputLeftElement>
                                <Input pl="68px" h = {"60px"} placeholder="0" size='lg' bg="rgb(93 132 202 / 60%)"
                                    fontSize={"30px"} value={amount} onChange={handleDeposit} type="number" required={true}/>
                        </InputGroup>
                        
                        <Box display={"flex"} alignItems={"flex-start"} mb={"5px"}>
                            <Text fontSize={"24px"} pl= "2px" mt={10}>Recipient Address :</Text>
                        </Box>
                        <InputGroup>
                        <Input h = {"60px"} placeholder="0x..."  size='lg' bg="rgb(93 132 202 / 60%)"
                        fontSize={"30px"}  onChange={handleAddress}/>
                        </InputGroup>
                    </Box>
                    <Box p="35px">
                        <Button  w="100%" h="60px" fontSize={"24px"} color={"white"} 
                        bgColor={"#ea6969"}  _hover={{ bgColor:"#d43b3b", 
                        cursor:"pointer"}}  onClick={()=>BridgeAssets()}>
                        Bridge Assets
                    </Button>
                    </Box>
                </Box>
            </Flex>
            <ToastContainer/>
            </Box>
        </>
    );
}