import { Box, Flex, Grid, List, ListIcon, ListItem, Text,Button,Center} from '@chakra-ui/react';
import React from 'react';
import { Select } from '@chakra-ui/react';
import { CheckIcon} from '@chakra-ui/icons'
import { Spinner } from '@chakra-ui/react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {ethers} from "ethers";
import RiskPool from '../../../../contracts/hardhat/artifacts/contracts/RiskPool.sol/RiskPool.json';
import { useEffect, useState} from 'react';

export default function Insurance(){

    const [policies,setPolicies] = useState();
    const RiskPoolAddress = import.meta.env.VITE_RISK_POOL
    const RPC_URL =  import.meta.env.VITE_RPC_URL;

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const riskPoolContract = new ethers.Contract(RiskPoolAddress,RiskPool.abi,provider);

    const optionStyle = { background: "#4c689d" };
    const riskArrays = ["Low Risk","Medium Risk","High Risk"];
    
    useEffect(()=>{
        async function getPolicies(){
            const pol = await riskPoolContract.getAllPolicies();
            const Content = pol.map((e) => {
                return {
                    id: parseInt(e[0]),
                    riskType: parseInt(e[1]),
                    asset:e[2],
                    coverPercent:parseInt(e[3]),
                    coverage:parseInt(e[4]),
                    premium:parseInt(e[5])
                }
            });
            setPolicies(Content);
        }
        getPolicies()
    },[policies])

    const handleSelectChange = (selectedLevel) => {
        const selectedLevelElement = document.getElementById(selectedLevel);
        if (selectedLevelElement) {
            selectedLevelElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

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

    const purchasePolicies = async(id,premium)=>{
    
        const accounts = await window.ethereum.request({method:'eth_accounts'});
        const addr = accounts[0];
        if(addr==null){
            toast.error("Please Connect Your Wallet", {
                position: toast.POSITION.TOP_CENTER
            });
        }
        else{
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const riskPool = new ethers.Contract(RiskPoolAddress, RiskPool.abi,provider.getSigner());
            const usdcABI = ['function approve(address spender, uint256 amount) returns (bool)'];
            const usdcAddress = "0x52d800ca262522580cebad275395ca6e7598c014";
            const usdcContract = new ethers.Contract(usdcAddress,usdcABI,provider.getSigner());
            const givenAllowance = await usdcContract.approve(RiskPoolAddress,premium);
            await givenAllowance.wait()
            const response = await riskPool.purchasePolicy(id);
            await response.wait()
            .then( () => {
                toast.success("Policy Purchased Succcessfully.", {
                position: toast.POSITION.TOP_CENTER
                });
              }).catch( () => {
                toast.success("Some error occured.", {
                  position: toast.POSITION.TOP_CENTER
                });
            })
        }
    }

    return(
        <Box pt={32} mb={10}>
            <Flex  pr={"20"} alignItems={"flex-end"} justifyContent={"flex-end"} mr={"auto"}>
                <Select alignItems="flex-end" maxW="200px" border={"none"}  background="#4c689d" fontSize={16}
                    size='lg' 
                    onChange={(e) => handleSelectChange(e.target.value)}>
                     <option selected hidden disabled value="">Select Risk Level</option>
                    {riskArrays.map((index) => (
                        <option style={optionStyle} key={index} value={index}> 
                            {index}
                        </option>
                    ))}
                </Select>
            </Flex>
            {!policies?<Center><Spinner size='xl' alignItems="center" justifyContent="center"/></Center>:
            <Flex direction="column" mb={1} mt={15} pl={16}>
             <Flex direction="column" w="100%" mt={10} pl={10} id="Low Risk" key="Low Risk">
                        <Text fontWeight="bold" fontSize="30px" mb={5}>
                            Low Risk
                        </Text>
                    <Grid marginBottom="4" w="100%" direction="row" templateColumns='repeat(4, 1fr)' gap={5}> 
                    {policies.map((policy) => (
                        policy.riskType==0 &&(
                        <Flex w="100%" >
                                <List  h="90%" w="75%" key="low" borderWidth="1px" borderColor={"#253350"}
                                    borderRadius="md" background="#4c689d" padding="6" marginRight="5"
                                    textAlign="left" fontSize="20px" spacing={3} marginBottom="8">
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
                                    <Box display="flex" alignItems = "center" justifyContent="center">
                                         <Button  mt="10px" fontSize="20px" background="#ea6969"
                                         color={"white"} 
                                         _hover={{ bg: "#d43b3b" }}
                                         onClick={()=>purchasePolicies(policy.id,policy.premium)}>
                                        Get Quote</Button>
                                    </Box>
                                </List>
                        </Flex>
                        )
                          ))}
                    </Grid>
            </Flex>
            <ToastContainer/>
            <Flex direction="column" w="100%" mt={10} pl={10} id="Medium Risk" key="Medium Risk">
                        <Text fontWeight="bold" fontSize="30px" mb={5}>
                            Medium Risk
                        </Text>
                       
                    <Grid marginBottom="4" w="100%" direction="row" templateColumns='repeat(4, 1fr)' gap={5}> 
                    {policies.map((policy, index) => (
                        policy.riskType==1 &&(
                        <Flex w="100%" >
                                <List  h="90%" w="75%" key="low" borderWidth="1px" borderColor={"#253350"}
                                    borderRadius="md" background="#4c689d" padding="6" marginRight="5"
                                    textAlign="left" fontSize="20px" spacing={3} marginBottom="8" >
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
                                    <Box display="flex" alignItems = "center" justifyContent="center">
                                         <Button  mt="10px" fontSize="20px" background="#ea6969"
                                         color={"white"} 
                                         _hover={{ bg: "#d43b3b" }}  onClick={()=>purchasePolicies(policy.id,policy.premium)}>
                                        Get Quote</Button>
                                    </Box>
                                </List>
                        </Flex>
                          )))}
                    </Grid>
            </Flex>
            <Flex direction="column" w="100%" mt={10} pl={10} id="High Risk" key="High Risk">
                        <Text fontWeight="bold" fontSize="30px" mb={5}>
                            High Risk
                        </Text>
                       
                    <Grid marginBottom="4" w="100%" direction="row" templateColumns='repeat(4, 1fr)' gap={5}> 
                    {policies.map((policy, index) => (
                        policy.riskType==2 &&(
                        <Flex w="100%" >
                                <List h="90%" w="75%" key="low" borderWidth="1px" borderColor={"#253350"}
                                    borderRadius="md" background="#4c689d" padding="6" marginRight="5"
                                    textAlign="left" fontSize="20px" spacing={3} marginBottom="8">
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
                                    <Box display="flex" alignItems = "center" justifyContent="center">
                                         <Button  mt="10px" fontSize="20px" background="#ea6969"
                                         color={"white"} 
                                         _hover={{ bg: "#d43b3b" }}
                                         onClick={()=>purchasePolicies(policy.id,policy.premium)}>
                                        Get Quote</Button>
                                    </Box>
                                </List>
                        </Flex>
                          )))}
                    </Grid>
            </Flex>
            </Flex>
}
    </Box>
    )
}