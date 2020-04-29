require("dotenv").config();

const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { abi, evm } = require("./compile");
const bytecode = evm.bytecode.object;

const provider = new HDWalletProvider(
  process.env.WALLET_MNEMONIC,
  process.env.INFURA_ENDPOINT
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log("Attempting to deploy using account " + accounts[0]);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: "0x" + bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  console.log("Contract is at " + result.options.address);
};
deploy();
