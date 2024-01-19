# HedgeInsurX

## :right_anger_bubble: Overview:

HedgeInsurX is a Platform where you can Generate safe yield on your Liquidity by Investing in our highly **Optimized-Strategies**. These strategies analyzes the Lending and Borrowing Rates of protocols like AAVE, Compound etc and Fees offered by Liquidity Pools in Uniswap and then deposits your Liquidity Accordingly such that the invested amount always earns a high yield. We have also implemented the functionality of **OnChain Protection** for users funds in the form of Insurance. Users can select from a variety of schemes based on their choice and get themselves Insured from any kind of Onchain-Risks. We have utilized Polygon ID's for issuing and verifiying the complete Insurance Claim process through our "**InsuranceClaims Credentials**". Users will have to submit a **ZK-Proof** of their Issued Credentials through **Polygon ID App** in order to get verified and receive **Cover Amount**. Also users can transfer their funds across multiple networks through our **Cross-Chain** Bridge implemented using **ChainLink's CCIP**.

![image](https://github.com/varunsh20/HedgeInsurX/assets/62187533/96fa2eda-48e8-4461-a6db-165d0edde4a4)

## :hammer_and_wrench: Tech Stack
### Backend
 - **Solidity** for writing Smart Contracts
 - **Remix** and **HardHat** for Smart Contract development and deployment.
 - **JavaScript** for writing deploy scripts and test cases. 
 - **Chai** library for testing smart contracts.
 - **Alchemy** for providing RPC node urls to interact and fetch data from blockchain.
 - **MetaMask** a simple browser extension wallet to store your funds and interact with the dApp to perform operations.
 - **ThirdWeb** library for easy wallet integration and supporting mulitple networks.
 - **ERC-20** standard for evm compatible tokens used in the dApp and **ERC-4626** contract for our Tokenized Vault used to provide claims amount to users.
 - SDK's and Smart Contracts of **AAVE-V3 (@aave/protocol-js), Compound-V3 or Comet (Compound.js) and UniSwap (@uniswap/v3-sdk & sdk-core )** for implementing these protocols in our **Strategies**.
 - **Zk-Proof** verifier contract used to verify the credentials submitted by users for the claim request verification process.
 - **CCIP** contract that is used to implement cross-chain bridge for transferring assets across multiple networks.

### Frontend
 - **JavaScript & React.js** for building interactive dynamic UI interface.
 - **Ethers.js** for integrating the Smart Contracts with UI application.
 - **Chakra-UI** Library for designing and styling UI.
   
## :computer: Getting Started
### :bangbang: Prerequisites
 - node
     ```
     >Node v16.5.0 
     ```
  - npm
    ```
    npm install npm@latest -g
    ```
### :gear: Installation
- Clone the repository
     ```
     git clone https://github.com/varunsh20/HedgeInsurX.git
     ```
- Install the dependencies
  ```
  npm install
  ```
### :key: Environment Variables
 - Add the values of the following varibles in your .env file
    ```
    VITE_RPC_URL
    VITE_PRIVATE_KEY
    ```
### :running_man: Run Locally
  - Go to frontend folder 
    ```
    cd frontend
    ```
  -  Run command
     ```
     npm run dev
     ```

Live App - https://hedgeinsurx.netlify.app/home
