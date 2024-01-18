//import { useTabs } from "../../context/TabsContext";
import { Box, HStack, Heading, Button, TabList, Tab, Tabs,TabIndicator} from "@chakra-ui/react";
import ethvibe from "../../assets/logo.png";
import {Link} from "react-router-dom";
import "./WalletButton.css";
import { ConnectWallet, ChainId,useNetworkMismatch,useNetwork,useAddress, darkTheme, lightTheme} from "@thirdweb-dev/react";


export default function Navbar(){
    
    return(
        <Box>
            <Box h="100px" w="100%" zIndex={"tooltip"} top={0} bg="rgba(16, 24 ,39, 0.7)" position={"fixed"}
                sx={{
                    backdropFilter: "blur(15px)",
                }}
            />
            <Box w="100%" position={"fixed"} zIndex={"tooltip"} bg="transparent" py={[0, 0, 8]} pb={[1, 1, 4]} px={[0, 0, 16]}>
                <HStack
                    border="solid 0.9px #253350"
                    bg="rgba(21, 34, 57, 0.8)"
                    w="100%"
                    h="80px"
                    borderRadius={"10px"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    py={[1, 1, 8]}
                    boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)" 
                    px={[3, 3, 12]}
                    sx={{
                        backdropFilter: "blur(15px)",
                    }}
                >
                    <Box>
                       <HStack>
                            <Box w="60px" h="60px" as="img" src={ethvibe}/>
                            <Heading color="white" ml="12px" mr = "40px" fontSize={"35px"} >
                                HedgeInsurX
                            </Heading>
                        </HStack>
                    </Box>
                    <Tabs mr = "auto" position="relative"  align="start" variant="unstyled" >
                        <TabList >
                        <Tab fontSize="22px" fontWeight="500"><Link to = "/home">Home</Link></Tab>
                        <Tab fontSize="22px" fontWeight="500"><Link to = "/dashboard">Dashboard</Link></Tab>
                        <Tab fontSize="22px" fontWeight="500"><Link to = "/insurance">Insurance</Link></Tab>
                        <Tab fontSize="22px" fontWeight="500"><Link to = "/bridge">Bridge</Link></Tab>
                        </TabList>
                        <TabIndicator mt="-1.5px" height="2px" bg="#5684db" borderRadius="1px"/>
                    </Tabs>
                    <Box>
                        <ConnectWallet className="cbtn">Connect Wallet</ConnectWallet>
                    </Box>
                </HStack>
            </Box >
        </Box>
    );
}
