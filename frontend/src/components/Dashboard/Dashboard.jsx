import { Box, Flex, List, Text,Button,Center, HStack, Image,Spinner} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {Link} from "react-router-dom";
import getAPYDetails from '../../context/LendingProtocols/V3Apr';
import {ethers} from "ethers";
import StrategyAbi from '../../../../contracts/hardhat/artifacts/contracts/Strategy.sol/Strategy.json';
import polygon from "../../assets/polygon.png";
import LeftPanel from "./LeftPanel";

export default function Dashboard(){

    const [apy,setApy] = useState();
    const [strategyDetails, setStrategyDetails]= useState();

    const RPC_URL =  import.meta.env.VITE_RPC_URL;
    const strategyPool = import.meta.env.VITE_STRATEGY;
    const rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const tokenLogo = import.meta.env.VITE_TOKEN_LOGO;

    useEffect(()=>{
        async function getAPY(){
            getStrategyDetails(apy);
        }
        getAPY();
    },[apy]);

    async function getStrategyDetails(){
        const response = await getAPYDetails();
        setApy(response.APY);
        const strat1 = {
            id:1,
            chain:polygon,
            token:tokenLogo,
            name:"Stablecoin Portfolio Strategy",
            risk:"Low",
            stratApy:response.APY,
            aum:await getAUM("0"),
            fees:"0.0005",
            content:"The Stablecoin Portfolio Strategy is a low risk - stable returns strategy. In this strategy user's funds are allocated in lending protocols like 'Aave', 'Compound' etc based on which protocol offers better lending rates for the same asset (currently USDC) and users earns interest on their supplied collateral from the corresponding protocol. They can close the position and withdraw their funds at any time they want.",
            pool:response.Pool,
            assetAddress:response.Address
        }
        const strat2 = {
            id:2,
            chain:polygon,
            token:tokenLogo,
            name:"Market Neutral LP Strategy",
            risk:"Medium",
            stratApy:response.APY+2,
            aum:await getAUM("1"),
            fees:"0.001", 
            content:"The Market Neutral LP Strategy is a medium risk - stable returns strategy. In this strategy some part of the user's funds are used as a collateral to borrow a high yield generating asset like 'WETH', 'WBTC' from lending and borrowing protocols like 'Aave', 'Compound' etc depending on which protocol offers cheaper rates for borrowing the same asset and then the pair of USDC+Borrowed asset is used to provide  liquidity to pools on popuplar DEX's like UniSwap, etc to generate returns from liquidity fees and other rewards. Users receives the interest on their collateral and liquidity supplied from the corresponding protocols, which they can close and withdraw their funds any time they want.",
            pool:response.Pool,
            assetAddress:response.Address
        } 
        // const strat3 = {
        //     id:3,
        //     chain:polygon,
        //     token:tokenLogo,
        //     name:"Perpetual Protocol Strategy",
        //     risk:"High",
        //     stratApy:response.APY,
        //     aum:await getAUM("2"),
        //     fees:"0.002",
        //     content:"The Perpetual Protocol Strategy is a high risk - high reward strategy. In this strategy user's funds are used to borrow some volatile assets from lending and borrowing protocols like 'Aave, 'Compound' etc depending on which protocol offers cheaper rate for borrowing the same asset. These assets are then used to take low leveraged positions on perpetual exchanges like GMX etc to generate returns. Users receives the corresponding amount of HIX shares in return that represents their position in our 4626 Tokenized vault, which they can close and withdraw their funds any time they want by depositing their HIX tokens.",
        //     pool:response.Pool,
        //     assetAddress:response.Address
        // }
        setStrategyDetails([strat1,strat2]);
    }

    async function getAUM(id){
        const strategyContract = new ethers.Contract(strategyPool,StrategyAbi.abi,rpcProvider);
        const response = await strategyContract.getassetsByStrategy(id);
        const amount = ethers.utils.formatUnits(response,6);
        return parseFloat(amount).toFixed(2);
    }
    
    return(
        <>
        <Flex w = "100%" pl="10">
        <LeftPanel/>
        <Box ml = {270} mt={40} pt={1.9} pl={10}>
            <Flex>
                <HStack  w="100%" mb="40px">
                    <List>
                    <Text fontWeight="bold" fontSize="28px">Trustless DeFi Strategies, Choose Any Strategy According To Your Risk Category. </Text>
                    <Text fontSize="22px" pt="10px">Earn high yields on your liquidity through our returns optimizing strategies.</Text>
                    </List>
                </HStack> 
            </Flex>
            {!strategyDetails?<Center><Spinner size='xl' alignItems="center" justifyContent="center"/></Center>:
            <Box mt={10}>
                <HStack pl="20px" spacing='30px' mb="15px" w= "110%">
                <Box w='8%' fontSize="20px" fontWeight="bold">
                    Chain
                </Box>
                <Box w ='8%' fontSize="20px" fontWeight="bold">
                    Token(s)
                </Box>
                <Box w='35%' fontSize="20px" fontWeight="bold">
                    Strategy
                </Box>
                <Box w='14%' fontSize="20px" fontWeight="bold">
                    Risk Category
                </Box>
                <Box w='90px' fontSize="20px" fontWeight="bold">
                    APR
                </Box>
                <Box w='18%' fontSize="20px" fontWeight="bold">
                    AUM
                </Box>
                </HStack>
                {strategyDetails.map((strategy)=>(

                    <HStack h="120px" w={"110%"} bg="#4c689d" borderRadius={"25px"} pl="20px" 
                    spacing='30px' mb={10}  border= "2px solid transparent"
                    _hover={{ border:"2px" ,borderColor:"#d0d7e4",  cursor:"pointer"}} >
                    <Box w ='8%'>
                        <Image w="56%" borderRadius={"30px"} background={"white"} src={strategy.chain} p="8px" alt="Mumbai" />
                    </Box>
                    <Box w ='8%' >
                        <Image src={strategy.token} borderRadius={"25px"}  w="56%" alt="USDC"/>
                    </Box>
                    <Box w='35%' fontSize="24px"  _hover={{ textDecoration:"underline" , cursor:"pointer"}}>
                        <Link to = "/strategies" state={strategy}>{strategy.name}</Link>
                    </Box>
                    <Box w='14%' fontSize="24px" alignItems="center" justifyContent="center">
                        <Text alignItems="center">{strategy.risk}</Text>
                    </Box>
                    <Box w='90px' fontSize="24px" >
                        {strategy.stratApy.toFixed(2)}%
                    </Box>
                    <Box w='18%' fontSize="24px">
                        $ {strategy.aum}
                    </Box>
                </HStack>)
                )}
            </Box>
        }
        </Box>
        </Flex>
        </>
    );
}