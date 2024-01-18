import Tickers from "../Tickers/Tickers";
import { Box,Text, Image, Button, Heading, HStack, VStack,Flex} from "@chakra-ui/react";
import {Link} from "react-router-dom";
import {FaTwitter, FaGithub,FaLinkedin} from 'react-icons/fa';
import ins from "../../assets/ins.webp";
import yeld from "../../assets/yeld.webp";
import bridge from "../../assets/bridge.png";

export default function Home(){
    return(
        <>
        <Box >
        <Tickers/>

        <Box  mt={6} p="50px" >
            <HStack spacing={10} display={"flex"} alignItems="flex-start" justifyContent="center"
            p="50px"> 
            <VStack display={"flex"} alignItems="flex-start" justifyContent="flex-start" spacing={6} w="50%"> 
                <Heading size="xl">Get The Best Yields</Heading>
                    <Text fontSize={"24px"} textAlign={"justify"}>
                        Invest in our Returns-Optimizied Strategies to Maximize your Yield. These Strategies analyzes the Lending and Borrowing rates,
                        Fees etc and then lends or borrows from different protocols like AAVE, Compound or provides liquidity to Uniswap etc accordingly such that maximum Yield is generated on your deposited amount.
                    </Text>
                    <VStack  display={"flex"} justifyContent={"flex-end"} alignItems={"flex-end"} mt={5}>
                    <Link to="/dashboard">
                    <Button fontSize="20px" background="#ea6969" color={"white"} _hover={{ bg: "#d43b3b" }}>
                        Get Started
                    </Button>
                    </Link>
                    </VStack>
            </VStack>
                <Box display={"flex"} alignItems="flex-end" justifyContent={"flex-end"} w="50%">
                    <Image objectFit='cover' maxW={{ base: '80%' }} src={yeld} alt='Defi Yield'/>
                </Box>
            </HStack>
            <HStack spacing={10} display={"flex"} alignItems="flex-start" justifyContent="center" p="50px"> 
                <Box display={"flex"} alignItems="flex-start" justifyContent={"flex-start"} w="50%">
                    <Image objectFit='cover' maxW={{ base: '88%' }} src={ins} alt='Insurance'/>
                </Box>
            <VStack display={"flex"} alignItems="flex-start" justifyContent="flex-end" spacing={4} w="50%"> 
                <Heading size="xl">Onchain Protection</Heading>
                    <Text fontSize={"23px"} textAlign={"justify"}>
                        Protect your Funds against any kind of OnChain Risks. Members
                        can buy any of the Cover Products offered by us based on their Risk Level, Cover Amount etc to get Insured. Members can make a claim request for any kind of loss, which will be assesed thoroughly and they will be issued Polygon Id Credentials that will determine thier claim validity.
                        They will be asked to submit the ZK-Proof of this Credential under the Verification process only then the cover Amount will be transferred. Cover amount is Sourced from our ERC-4626 Tokenized Vault. Users can also choose to become our Liquidity Providers where they can get monthly
                        Incentives conditionally, depending upon if there are enough funds in the vault to meet the Claim Requests.

                    </Text>
                    <VStack  display={"flex"} justifyContent={"flex-end"} alignItems={"flex-end"} mt={2}>
                    <Link to="/insurance">
                    <Button fontSize="20px" background="#ea6969" color={"white"} _hover={{ bg: "#d43b3b" }}>
                        Buy Cover 
                    </Button>
                    </Link>
                    </VStack>
            </VStack>
            </HStack>
            <HStack spacing={10} display={"flex"} alignItems="flex-start" justifyContent="center"
            p="50px"> 
            <VStack display={"flex"} alignItems="flex-start" justifyContent="flex-start" spacing={6} w="50%"> 
                <Heading size="xl">Bridge Your Assets</Heading>
                    <Text fontSize={"24px"} textAlign={"justify"}>
                       Users can use our Bridge to Transfer their Tokens across Multiple Networks. We have implemented
                       the ChainLink's CCIP functionality to create our Cross-Chain Bridge. Currently we are supporting only 4 Networks i.e 
                       Mumbai, Sepolia, BSC Testnet, Arbitrum Sepolia with CCIP test Token Bnm, as BnM and LnM are the only two test tokens supported
                       by CCIP currently.
                    </Text>
                    <VStack  display={"flex"} justifyContent={"flex-end"} alignItems={"flex-end"} mt={5}>
                    <Link to="/bridge">
                    <Button fontSize="20px" background="#ea6969" color={"white"} _hover={{ bg: "#d43b3b" }}>
                        Bridge
                    </Button>
                    </Link>
                    </VStack>
            </VStack>
                <Box display={"flex"} alignItems="flex-end" justifyContent={"flex-end"} w="50%">
                <Image objectFit='cover' maxW={{ base: '80%' }} 
                    src={bridge}
                    alt='Cross Chain Bridge'/>
                </Box>
            </HStack>
        </Box>
        <Box p={10}>
            <Flex flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                <HStack spacing={8}display={"flex"} alignItems={"center"} justifyContent={"center"}>
                    <Link to="https://www.linkedin.com/in/varunsh20/"><FaLinkedin size={30}/></Link>
                    <Link to="https://github.com/varunsh20"><FaGithub size={30}/></Link>
                    <Link to="https://twitter.com/varunsh_20"><FaTwitter size={30}/></Link>
                </HStack>
                <Box pt={6}>
                    <Text fontSize={"22px"} fontWeight={600}>
                        &copy; {new Date().getFullYear()} Copyright: HedgeInsurX
                    </Text>
                </Box>
            </Flex>
        </Box>
        </Box>
        </>
    );
}