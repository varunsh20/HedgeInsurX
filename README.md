# HedgeInsurX

## :right_anger_bubble: Overview:

HedgeInsurX is a Platform where you can Generate safe yield on your Liquidity by Investing in our highly **Optimized-Strategies**. These strategies analyzes the Lending and Borrowing Rates of protocols like AAVE, Compound etc and Fees offered by Liquidity Pools in Uniswap and then deposits your Liquidity Accordingly such that the invested amount always earns a high yield. We have also implemented the functionality of **OnChain Protection** for users funds in the form of Insurance. Users can select from a variety of schemes based on their choice and get themselves Insured from any kind of Onchain-Risks. We have utilized Polygon ID's for issuing and verifiying the complete Insurance Claim process through our "**InsuranceClaims Credentials**". Users will have to submit a **ZK-Proof** of their Issued Credentials through **Polygon ID App** in order to get verified and receive **Cover Amount**. Also users can transfer their funds across multiple networks through our **Cross-Chain** Bridge implemented using **ChainLink's CCIP**.

[View dApp](https://hedgeinsurx.netlify.app/)

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
## :eyes: Usage

**This project main focusses on Three main Domains. Their usage and working in the project are desrcibed as below:-**

### Defi Yield Strategies
  - We allow users to invest their liquidity in our strategies to generate safe and stable returns.
  - Currently there are two different types of strategies that differs in the way they handle the liquidity to generate returns.
     ![image](https://github.com/varunsh20/HedgeInsurX/assets/62187533/fb9c58f3-80a9-4686-a60f-5310ac494a33)

 - **First One** is a **Low-Risk & Stable Returns** type Strategy and is more suitable for those who wants to invest for a **Long-Term**. This strategy compares the Lending
   Rates of assets (Currently USDC) on platforms like AAVE, Compound etc and invests in the protocol that offers better rates. Users are free to withdraw thier funds           and close the position any time they want.
    ![image](https://github.com/varunsh20/HedgeInsurX/assets/62187533/03c840c2-c0e0-4190-ad3a-222fccd7b8e7)

- **Second Strategy** is of medium risk category and generates slightly better yield than first one. This strategy works by investing half amount of user's funds as  
  collateral in AAVE where it earns interest, it then borrows another asset (USDT currently) against the supplied collateral and supply the remaining amount of asset and the 
  borrowed token (USDC+UDST) in a pair to USDC-USDT Liquidity Pool in Uniswap-V3 where the liquidity earns the Trading fees. Here users will have to close the complete  
 position and withdraw their funds plus the fees rewards earned all at once.

  ![image](https://github.com/varunsh20/HedgeInsurX/assets/62187533/ecdc4884-1722-4704-88b1-68c4b2627574)

### OnChain Insurance
 - We have integrated the capability of providing **OnChain Insurance** to protect User's funds against any kind of Onchain Risk including a bug in the code, Rug Pull, etc.
 - We have three different categories of Insurance Schemes based on Low, Medium and High Risk level that are further divided on the basis of Cover Amount and Duration like 1 , 3 and 6 months. So that makes a total of 9 Insurance Schemes.
 - Users can select from any of these schemes according to their choice and pay premium amount all at once.
   ![image](https://github.com/varunsh20/HedgeInsurX/assets/62187533/4e55de23-ded4-4e83-b60b-b11aa05f403f)

 ### Claim Verification
  **We have used Polygon ID's for issuing credentials and for our claim verification process. The complete process from request to receiving funds is explained below.**
   - First users will have to submit a **Claim Request** form under their purchased policies, that asks for some basic user details like their Polygon DID's (to issue credentials to them directly), approx loss amount, event date etc.
      ![image](https://github.com/varunsh20/HedgeInsurX/assets/62187533/8193512d-36a7-4647-91ef-0b72a56b08da)

   - After detailed verification from our side, they will be issued a credential namely **InsuranceClaimsCredential** that contains an attribute called **validClaimRequest**. It's value determines whether the claim request made by user is authentic and valid.

 - In order to complete the verification process, users will have to scan and submit the ZK-Proof of their issued credential that will transfer the funds after successful 
   verification.
   ![image](https://github.com/varunsh20/HedgeInsurX/assets/62187533/baa27c40-8f93-4182-8ed7-7830c65b5098)  

- Below is a demo implementation of how they credentials are issued and stored in App. For sample we have generated the credentials directly from the issuer's QR code.
  

https://github.com/varunsh20/HedgeInsurX/assets/62187533/98fc7353-6655-493c-8670-322e60eba576



 - These credentials are verified OnChain using **@iden3's ZKPVerifier && Polygon ID validator smart contracts**. This happens when user scans the QR code that contains the ZKP Query Request in which we set the value of **validClaimRequest as 1** so that it is passed only for those credentials that have its value as **true**.
 -  After the credential value matches with the query, users are prompted to select their wallet where the function **submitZKPResponse()** is called.
- Here is a demo showing how claim requests are validated from the UI's QR and how ZK-Proofs are submitted.
https://drive.google.com/file/d/1ar3GMlZwG-X5V1XOFXpaOY5_u0_QllDz/view?usp=sharing

### Cross Chain Bridge
 - Users can transfer their assets cross-chain using our **Bridge**.
 - This Bridge is implemented using **ChainLink's CCIP**. Currently we support cross-chain transfers across 4 networks i.e. **Mumbai, Sepolia, BSC Testnet, Arbitrum Sepolia**.
 - On testnet chainlink supports only its native BnM and LnM tokens, so we have used BnM tokens as the main asset. And fees is paid using Link's token.
    ![image](https://github.com/varunsh20/HedgeInsurX/assets/62187533/7c83f383-069b-48f5-8435-8fa99a4ff6bc)
- Users first transfer their assets to our smart contract which then calls the CCIP's smart contract for asset transfers. Our contract is already funded with Link tokens on all the networks for paying the gas fees for cross-chain transfers.

## :ledger: References:
**Following References were used for implementing different functionalities in the project:-**
 - https://devs.polygonid.com/docs/verifier/on-chain-verification/overview/
 - https://github.com/aave/aave-utilities
 - https://docs.compound.finance/collateral-and-borrowing/
 - https://docs.chain.link/ccip/tutorials/cross-chain-tokens

**Please drop a :star2: on the repo if you like it.**
