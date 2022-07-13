const privKey = "";
const publicAddy = "";
const rpc = "";
const maxFee = "";
const maxPrioFee = "";

// put in info here i can't get the env file working :(

const axios = require("axios").default;
const Web3 = require("web3");
const web3 = new Web3(
  rpc
);
const { ethers } = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(rpc)
require("log-timestamp");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}



async function buy() 
{
  console.log("starting up ...")
  let firstPart = web3.eth.abi.encodeFunctionSignature(
    `assassinate(bytes,uint256,uint256,address,uint256,uint256)`
  );

  while (1) 
  {
    let response = await axios.get("https://wzrds.xyz/peddler/targets");
    toSnipe = response.data.targets[0]
    if (response.data.targets.length == 0) 
    {
      console.log("no new listings to burn");
      await sleep(100);
      continue;
    }

    console.log("new listing to burn found");
    console.log(toSnipe);

    let secondPart = web3.eth.abi.encodeParameters(
      ["bytes", "uint256", "uint256", "address", "uint256", "uint256"],
      [
        toSnipe.proof,
        toSnipe.token_id.toString(),
        "20000000000000000000000",
        toSnipe.owner_address,
        toSnipe.expires_at.toString(),
        toSnipe.nonce.toString(),
      ]
    );
    const hexData = firstPart + secondPart.slice(2);
    console.log("Your hex data", hexData);
    const transaction = await web3.eth.accounts.signTransaction(
      {
        to: "0x6A27Ed5248D0557D016C0aA2D5FFa59fe273E666",
        value: ethers.utils.parseEther("0"),
        data: hexData,
        maxFeePerGas: ethers.utils.parseUnits(maxFee, "gwei"),
        maxPriorityFeePerGas: ethers.utils.parseUnits(maxPrioFee, "gwei"),
        gas: 180000,
      },
      privKey
    );
    console.log("Sending Tx now")
    web3.eth.sendSignedTransaction(transaction.rawTransaction).on('receipt', console.log);
    return 0;
  }
}


buy();
