import LeftPanel from "./LeftPanel";
import { Box, Flex, Grid, List, ListIcon, ListItem, Text,Button,Center,HStack,Input,InputGroup,
FormLabel,FormControl} from '@chakra-ui/react';
import {Modal,ModalOverlay,ModalContent,ModalHeader,ModalFooter,ModalBody,ModalCloseButton,useDisclosure} from '@chakra-ui/react'
import { useAddress } from '@thirdweb-dev/react';
import React from 'react';
import QRCode from 'react-qr-code';
import { CheckIcon} from '@chakra-ui/icons'
import { Spinner } from '@chakra-ui/react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {ethers} from "ethers";
import RiskPool from '../../../../contracts/hardhat/artifacts/contracts/RiskPool.sol/RiskPool.json';
import { useEffect, useState} from 'react';

export default function MyPolicies(){

    const [myPolicies,setMyPolicies] = useState();
    const [did, setDid] = useState();
    const [email, setEmail] = useState();
    const [loss, setLoss] = useState();
    const [eventDate, setEventDate] = useState();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen:isProofOpen, onOpen: onProofOpen, onClose:onProofClose } = useDisclosure()
    const addr = useAddress();
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)

    const OverlayOne = () => (
        <ModalOverlay backdropFilter='blur(10px)'/>
        )

    const [overlay, setOverlay] = React.useState(<OverlayOne />)

    const handleDid = (event)=>setDid(event.target.value);
    const handleEmail = (event)=>setEmail(event.target.value);
    const handleLoss = (event)=>setLoss(event.target.value);
    const handleDate = (event)=>setEventDate(event.target.value);

    const RiskPoolAddress = import.meta.env.VITE_RISK_POOL;
    const aavePool = import.meta.env.VITE_AAVE_POOL;
    const claimVerifier = import.meta.env.VITE_VERIFIER_ADDRESS;
    const RPC_URL =  import.meta.env.VITE_RPC_URL;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const riskPoolContract = new ethers.Contract(RiskPoolAddress,RiskPool.abi,rpcProvider);

    useEffect(()=>{

        async function getMyPolicies(){
            const polices = await riskPoolContract.getCustomerPolicies(addr);
            const Content = polices.map((e) => {
                return {
                    id: parseInt(e[0]),
                    riskType: parseInt(e[1]),
                    asset:e[2],
                    coverPercent:parseInt(e[3]),
                    coverage:parseInt(e[4]),
                    premium:parseInt(e[5])
                }
            });
            setMyPolicies(Content);
        }

        getMyPolicies();
    },[myPolicies])

    function getRiskType(risk){
        if(risk=="0"){
            return "Low Risk";
        }
        else if(risk=="1"){
            return("Medium Risk");
        }
        else if(risk=="2"){
            return("High Risk");
        }
    }
    
    function getMonths(time){
        return time/(24*60*60);
    }
    
    function getAmount(weiAmount){
        return ethers.utils.formatUnits(weiAmount,6);
    }

    async function submitClaimRequest(id){
        // const accounts = await window.ethereum.request({method:'eth_accounts'});
        // const addr = accounts[0];
        if(addr==""){
            toast.error("Please Connect Your Wallet.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else if(did==null){
            toast.info("No DID Provided.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else if(email==null){
            toast.info("No Email-ID Provided.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else if(loss==null){
            toast.info("Please Provide An Amount Of Estimated Loss.", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else if(eventDate==null){
            toast.info("Please Provide The Date of Event.", {
                position: toast.POSITION.TOP_CENTER
            });
        }

        else{
            const riskPoolWriteContract = new ethers.Contract(RiskPoolAddress,RiskPool.abi,provider.getSigner());
            const amountWei = ethers.utils.parseUnits(loss,6);
            const tx = await riskPoolWriteContract.makeClaimRequest(did,email,aavePool,eventDate,amountWei,id);
            await tx.wait();
        }
    }

    //generating proof Request
    const qrProofRequestJson = {
        id: "f8aee09d-f592-4fcc-8d2a-8938aa26676c",
        typ: "application/iden3comm-plain-json",
        type: "https://iden3-communication.io/proofs/1.0/contract-invoke-request",
        thid: "f8aee09d-f592-4fcc-8d2a-8938aa26676c",
        body: {
            reason: "Insurance claim credential",
        transaction_data: {
        contract_address: claimVerifier,
        method_id: "b68967e2",
        chain_id: 80001,
        network: "polygon-mumbai"
        },
        scope: [
        {
            id: 1,
            circuitId: "credentialAtomicQuerySigV2OnChain",
            query: {
                allowedIssuers: ["*"],
                context:"ipfs://QmQRpqJr5sBP8s55EBCRXtttLDAph6SnCmHpNjqGy7BoS4",
                credentialSubject: {
                validClaimRequest: {
                    $eq: 1
                }
            },
            type: "InsuranceClaims"
            }
        }
        ]}
    };

    return(
        <>
        <Flex w = "100%" pl="10">
        <LeftPanel/>
        <Box ml = {270} mt={40} pt={1.9} pl={10}>
            <Flex>
                <HStack  w="100%" fontWeight="bold" fontSize="28px" mb="40px">
                    <Text>Check out your purchased policies and make a valid claim request accordingly...</Text>
                </HStack> 
            </Flex>
            <Box pt={2} mb={10}>
                {!addr?(
                    <HStack  w="100%" fontWeight="bold" fontSize="28px" mb="40px">
                        <Text>Please Connect Your Wallet</Text>
                    </HStack> 
                ):
                <>{!myPolicies?<Center><Spinner size='xl' alignItems="center" justifyContent="center"/></Center>:
            <Flex direction="column" mb={1} mt={2}>                      
                <Grid marginBottom="4" w="100%" direction="row" templateColumns='repeat(4, 1fr)' gap={5}> 
                    {myPolicies.map((policy) => (
                        policy.riskType==0 &&(
                        <Flex w="100%" >
                                <List h="92%" w="90%" key="low" borderWidth="1px" borderColor={"#253350"}
                                    borderRadius="md" background="#4c689d" padding="6" marginRight="5" textAlign="left"
                                    fontSize="20px" spacing={3} marginBottom="8">
                                    <>
                                        <ListItem>
                                            <ListIcon><CheckIcon color="red.500" /></ListIcon>
                                            {getRiskType(policy.riskType)} type Policy.
                                        </ListItem>
                                        <ListItem>
                                            <ListIcon><CheckIcon color="red.500"/></ListIcon>
                                            Covers upto {policy.coverPercent}% of your loss.
                                        </ListItem>
                                        <ListItem>
                                            <ListIcon><CheckIcon color="red.500"/></ListIcon>
                                            Valid upto {getMonths(policy.coverage)} days.
                                        </ListItem>
                                        <ListItem>
                                            <ListIcon><CheckIcon color="red.500"/></ListIcon>
                                            Total premium to be paid is just {(getAmount(policy.premium)).split(".")[0]} USDC.
                                        </ListItem>
                                    </>
                                    <Box display="flex" alignItems = "center" justifyContent="center"
                                    flexDirection={"row"} gridGap={"20px"}>
                                         <Button  mt="10px" fontSize="20px" background="#ea6969"
                                         color={"white"} _hover={{ bg: "#d43b3b" }} w="70%"
                                         onClick={() => {setOverlay(<OverlayOne />) 
                                        onOpen()}}>Request Claim</Button>

                                        <Button  mt="10px" fontSize="20px" background="#ea6969"
                                         color={"white"} _hover={{ bg: "#d43b3b" }}  w="70%"
                                         onClick={() => {setOverlay(<OverlayOne />) 
                                                        onProofOpen()}}>Verify Claim</Button>
                                    </Box>
                                <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} 
                                    isOpen={isOpen} onClose={onClose} isCentered size={"xl"} mt="200px">
                                   
                                    {overlay}
                                <ModalContent h={"65%"} bg="rgba(21, 34, 57, 0.6)" border="solid 0.9px #253350"  maxH={"fit-content"}>
                                        <ModalHeader>Submit your claim request</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody >
                                    <FormControl>
                                        <FormLabel fontSize={"22px"}>User DID</FormLabel>
                                            <Input h = {"50px"} ref={initialRef} placeholder='000...' 
                                             bg="rgb(93 132 202 / 60%)" required={true} 
                                             value={did} onChange={handleDid}/>
                                    </FormControl>
                                    <FormControl mt={4}>
                                        <FormLabel fontSize={"22px"}>Email</FormLabel>
                                            <Input h = {"50px"} placeholder='abc@xyz.com' bg="rgb(93 132 202 / 60%)"
                                            required={true} value={email} onChange={handleEmail}/>
                                    </FormControl>
                                    <FormControl mt={4}>
                                        <FormLabel fontSize={"22px"}>Estimated Loss:</FormLabel>
                                            <Input h = {"50px"} placeholder='0' bg="rgb(93 132 202 / 60%)" type="number"
                                            required={true} value={loss} onChange={handleLoss}/>
                                    </FormControl>
                                    <FormControl mt={4}>
                                        <FormLabel fontSize={"22px"}>Event Date</FormLabel>
                                            <Input h = {"50px"} bg="rgb(93 132 202 / 60%)"
                                            type="date" required={true} value={eventDate} onChange={handleDate}/>
                                    </FormControl>
                                    </ModalBody>
                                    <ModalFooter pb="20px">
                                        <Button colorScheme='blue' mr={3} background="#ea6969"
                                         color={"white"} _hover={{ bg: "#d43b3b" }}
                                         onClick={()=>{submitClaimRequest(policy.id)}}>
                                            Submit
                                        </Button>
                                        <Button onClick={onClose}>Cancel</Button>
                                    </ModalFooter>
                                    </ModalContent>
                                </Modal>
                                <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} 
                                    isOpen={isProofOpen} onClose={onProofClose} isCentered size={"xl"} mt="2px">
                                    {overlay}
                                    <ModalContent h={"72%"} bg="rgba(21, 34, 57, 0.6)" border="solid 0.9px #253350">
                                        <ModalHeader >Verify Your Issued Credentials.</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody display={"flex"} alignItems={"center"} flexDirection={"column"}>
                                        <Text mb="10px" fontSize={"20px"}>
                                            Scan the following QR code from your PolygonId App to complete the verification process of your issued Insurance Claim Credentials. 
                                            This works by generating a ZK-Proof of your credential which is then is verified on-chain by our Smart Contract.
                                        </Text>
                                        <QRCode size={256} style={{width: "100%", background:"white"}} 
                                        value={JSON.stringify(qrProofRequestJson)}/>
                                    </ModalBody>
                                    </ModalContent>
                                </Modal>
                                </List>
                        </Flex>
                        )))}
                    </Grid>
            </Flex>
}</>}
            <ToastContainer/>
            </Box>
        </Box>
        </Flex>
        </>
    )
}