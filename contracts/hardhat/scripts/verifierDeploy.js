const {ethers} = require("hardhat");
const { Web3 } = require('web3');
const { poseidon } = require('@iden3/js-crypto');
const { SchemaHash } = require('@iden3/js-iden3-core');
const {Path, getDocumentLoader, Merklizer } = require('@iden3/js-jsonld-merklization');


const Operators = {
  NOOP : 0, // No operation, skip query verification in circuit
  EQ : 1, // equal
  LT : 2, // less than
  GT : 3, // greater than
  IN : 4, // in
  NIN : 5, // not in
  NE : 6   // not equal
}
const rpcAddress = "https://polygon-mumbai.g.alchemy.com/v2/B4HZBW5VlKKuMvgYcgRMSEHPO_tFEwd1";
function packValidatorParams(query, allowedIssuers = []) {
  let web3 = new Web3(Web3.givenProvider ||  new Web3.providers.HttpProvider(rpcAddress));
  return web3.eth.abi.encodeParameter(
    {
      CredentialAtomicQuery: {
        schema: 'uint256',
        claimPathKey: 'uint256',
        operator: 'uint256',
        slotIndex: 'uint256',
        value: 'uint256[]',
        queryHash: 'uint256',
        allowedIssuers: 'uint256[]',
        circuitIds: 'string[]',
        skipClaimRevocationCheck: 'bool',
        claimPathNotExists: 'uint256'
      }
    },
    {
      schema: query.schema,
      claimPathKey: query.claimPathKey,
      operator: query.operator,
      slotIndex: query.slotIndex,
      value: query.value,
      queryHash: query.queryHash,
      allowedIssuers: allowedIssuers,
      circuitIds: query.circuitIds,
      skipClaimRevocationCheck: query.skipClaimRevocationCheck,
      claimPathNotExists: query.claimPathNotExists
    }
  );
}

function coreSchemaFromStr(schemaIntString) {
  const schemaInt = BigInt(schemaIntString);
  return SchemaHash.newSchemaHashFromInt(schemaInt);
};

let prepareCircuitArrayValues = (arr, size) => {
  if (!arr) {
    arr = [];
  }
  if (arr.length > size) {
    throw new Error(`array size ${arr.length} is bigger max expected size ${size}`);
  }

  // Add the empty values
  for (let i = arr.length; i < size; i++) {
    arr.push(BigInt(0));
  }
  return arr;
};

function calculateQueryHash(
  values,
  schema,
  slotIndex,
  operator,
  claimPathKey,
  claimPathNotExists
) {
  const expValue = prepareCircuitArrayValues(values, 64);
  const valueHash = poseidon.spongeHashX(expValue, 6);
  const schemaHash = coreSchemaFromStr(schema);
  const quaryHash = poseidon.hash([
    schemaHash.bigInt(),
    BigInt(slotIndex),
    BigInt(operator),
    BigInt(claimPathKey),
    BigInt(claimPathNotExists),
    valueHash
  ]);
  return quaryHash;
}

const LIQUIDITY_VAULT = "0x22d17a4eBef6b2745E692440507F25E57cA15ac9";
const ASSET_ADDRESSS = "0x52d800ca262522580cebad275395ca6e7598c014";
const RISK_POOL = "0xef97153D51004B02116479Ac6Bc879f9d02287d0";

async function main() {

  const contractName = "InsuranceClaimVerifier"
 
  const InsuranceClaimVerifierFactory = await ethers.getContractFactory(contractName);
  const insuranceClaimInstance = await InsuranceClaimVerifierFactory.deploy(ASSET_ADDRESSS,
    LIQUIDITY_VAULT,RISK_POOL);

  await insuranceClaimInstance.waitForDeployment();
  const address = await insuranceClaimInstance.getAddress();
  console.log("Contract Address: ", address);
  

  // merklized path to field in the W3C credential according to JSONLD  schema e.g. birthday in the KYCAgeCredential under the url "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld"
  //const schemaClaimPathKey = "16346625018666499236962389756665927708147999623498413210108726247310719140462"
  // set default query
  // const insuranceClaimInstance = await ethers.getContractAt("InsuranceClaimVerifier","0x6B20b31Becbf65a3dFCE8AC66b128ED4F1c61b8C");
  // const address = await insuranceClaimInstance.getAddress();

  const schema = "8041622893635290168644782089780496421";
  const value = [1, ...new Array(63).fill(0).map(i => 0)]; // for operators 1-3 only first value matters
  const slotIndex = 0; // schema  is merklized for merklized credential,
  const schemaUrl = 'ipfs://QmQRpqJr5sBP8s55EBCRXtttLDAph6SnCmHpNjqGy7BoS4';
  const schemaClaimPathKey = "20882883257244635141408404958532374707952446610470408169707308251601341900272";
  const type = 'InsuranceClaims';
  const fieldName = 'validClaimRequest'; 
  const claimPathDoesntExist = 0; // 0 for inclusion (merklized credentials) - 1 for non-merklized

  const circuitIdSig = 'credentialAtomicQuerySigV2OnChain';
  const circuitIdMTP = 'credentialAtomicQueryMTPV2OnChain';
  
  // current sig validator address on mumbai
  const validatorAddressSig = '0x1E4a22540E293C0e5E8c33DAfd6f523889cFd878';
   
  // current mtp validator address on mumbai
  const validatorAddressMTP = '0x0682fbaA2E4C478aD5d24d992069dba409766121';
 
  const chainId = 80001;
  const network = 'polygon-mumbai';

  //script to generate claimPathkey
  // const pathToCredentialSubject = 'https://www.w3.org/2018/credentials#credentialSubject';

  // const opts = { ipfsGatewayURL: 'https://ipfs.io' }; // can be your IFPS gateway if your work with ipfs schemas or empty object
  // //const ldCtx = (await getDocumentLoader(opts)(schemaUrl)).document;
  // const ldCtx = {"@context":[{"@protected":true,"@version":1.1,"id":"@id","type":"@type","InsuranceClaims":{"@context":{"@propagate":true,"@protected":true,"polygon-vocab":"urn:uuid:f98232b5-a856-490f-ac01-3d42dfe09016#","xsd":"http://www.w3.org/2001/XMLSchema#","validClaimRequest":{"@id":"polygon-vocab:validClaimRequest","@type":"xsd:boolean"}},"@id":"urn:uuid:14cd4936-f206-48a6-a636-42001677c02d"}}]};
  // const ldJSONStr = JSON.stringify(ldCtx);
  // const path = await Path.getContextPathKey(ldJSONStr, type, fieldName, opts);
  // path.prepend([pathToCredentialSubject]);
  // const pathBigInt = await path.mtEntry();

  // console.log('path', pathBigInt.toString());

  const query = {
    schema: schema,
    claimPathKey:schemaClaimPathKey,
    operator: Operators.EQ,
    slotIndex: slotIndex,
    value: value,
    queryHash: calculateQueryHash(
      value,
      schema,
      slotIndex,
      Operators.EQ,
      schemaClaimPathKey,
      claimPathDoesntExist
    ).toString(),
    circuitIds: [circuitIdSig],
    allowedIssuers: [],
    skipClaimRevocationCheck: false,
    claimPathNotExists: claimPathDoesntExist,
  };

  const requestIdSig = await insuranceClaimInstance.TRANSFER_REQUEST_ID();

  const invokeRequestMetadata = {
    id: '14cd4936-f206-48a6-a636-42001677c02d',
    typ: 'application/iden3comm-plain-json',
    type: 'https://iden3-communication.io/proofs/1.0/contract-invoke-request',
    thid: '14cd4936-f206-48a6-a636-42001677c02d',
    body: {
      reason: 'for testing',
      transaction_data: {
        contract_address: address,
        method_id: 'b68967e2',
        chain_id: chainId,
        network: network
      },
      scope: [
        {
          id: 1,
          circuitId: circuitIdSig,
          query: {
            allowedIssuers: ['*'],
            context: schemaUrl,
            credentialSubject: {
            validClaimRequest: {
                $eq: 1
            }
            },
            type: type
          }
        }
      ]
    }
  };

  try {
    // sig request set
    const txSig = await insuranceClaimInstance.setZKPRequest(requestIdSig, {
      metadata: JSON.stringify(invokeRequestMetadata),
      validator: validatorAddressSig,
      data: packValidatorParams(query)
    });
    await txSig.wait();
    console.log(txSig.hash);
  }catch (e) {
    console.log('error: ', e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });