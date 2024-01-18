import { Box, VStack, Text, Button } from '@chakra-ui/react'
import { FaChartBar } from 'react-icons/fa';
import { MdFlashOn } from 'react-icons/md';
import {Link} from "react-router-dom";
import { ConnectWallet, useAddress } from '@thirdweb-dev/react'
import { useState,useEffect } from 'react';
export default function LeftPanel(){
    const [isSignedIn, setIsSignedIn] = useState(false);
    const address = useAddress();

    useEffect(() => {
        if (address==null) {
            setIsSignedIn(false);
        } else {
            setIsSignedIn(true);
        }
    }, [address]);
    
    return(
        <>
        <VStack
                h="95vh"
                position={"fixed"}
                maxW={"250px"}
                w="100%"
                pt={28}
                pb={4}
                top={5}
            >

                <Box
                    borderRadius={"12px"}
                    w="100%"
                    h="100%"
                    bg="rgba(21, 34, 57, 0.6)"
                    border="solid 0.9px #253350"
                    py={8}
                    px={[2, 2, 6]}
                    display={"flex"}
                    flexDirection={"column"}
                    justifyContent={"space-between"}
                    zIndex={2}
                    _hover={{boxShadow:'0px 0px 10px 0.2px #5684db'}}
                >
                    <Box>
                        <Button
                            leftIcon={<FaChartBar />}
                            colorScheme='transparent'
                            fontSize="20px"
                        >
                            <Link to = "/dashboard" > 
                                <Text pl={2} _hover={{cursor:"hover", textDecoration:"underline"}}>Strategies</Text>                
                            </Link>
                        </Button>
                        <br />
                        <br />
                        <Button
                            leftIcon={<MdFlashOn />}
                            colorScheme='transparent'
                            fontSize="20px"
                        >
                            <Link to = "/myPolicies"> 
                                <Text pl={2} _hover={{cursor:"hover", textDecoration:"underline"}}>My Policies</Text>                
                            </Link>
                        </Button>
                    </Box>

                    {!isSignedIn && (
                        <Box
                            py={6}
                            bg="#182942"
                            sx={{
                                backdropFilter: " saturate(140%)",
                            }}
                            textAlign={"center"}
                            px={2}
                            display={"flex"}
                            flexDirection={"column"}
                            justifyContent={"center"}
                            alignItems={"center"}
                            borderRadius={"15px"}
                        >


                            <Text
                                fontSize={"md"}
                                fontWeight={"bold"}
                            >Get Started By Connecting your Wallet</Text>
                            <Text
                                fontSize={"xs"}
                                color={"whiteAlpha.600"}
                                py={2}
                            >Discover new possibilities and more features by connecting your wallet.</Text>

                            <Box>
                                <ConnectWallet />
                            </Box>
                        </Box>
                    )}

                </Box>
            </VStack>
        </>
    )
}