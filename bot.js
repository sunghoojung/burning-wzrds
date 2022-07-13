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

let i = 0;

async function buy() {
  try {
    console.log("starting up ...")
    
    while (i == 0) {
      let response = await axios.get("https://wzrds.xyz/peddler/targets");
      if (response.data.targets.length != 0) {
        console.log("new listing to burn found");
        console.log(response.data.targets[0]);

        let firstPart = web3.eth.abi.encodeFunctionSignature(
          `assassinate(bytes,uint256,uint256,address,uint256,uint256)`
        );
        let secondPart = web3.eth.abi.encodeParameters(
          ["bytes", "uint256", "uint256", "address", "uint256", "uint256"],
          [
            response.data.targets[0].proof,
            response.data.targets[0].token_id.toString(),
            "20000000000000000000000",
            response.data.targets[0].owner_address,
            response.data.targets[0].expires_at.toString(),
            response.data.targets[0].nonce.toString(),
          ]
        );
        const hexData = firstPart + secondPart.slice(2);
        console.log(hexData);
        const estGas = await provider.estimateGas({
          from: publicAddy,
          to: "0x6A27Ed5248D0557D016C0aA2D5FFa59fe273E666",
          data: hexData,
          maxFeePerGas: ethers.utils.parseUnits("100", "gwei"),
          maxPriorityFeePerGas: ethers.utils.parseUnits("100", "gwei"),
        });
        console.log(estGas.toNumber());
        if (estGas.toNumber() <= 200000) {
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
          web3.eth.sendSignedTransaction(
            transaction.rawTransaction,
            function (error, hash) {
              if (!error) {
                console.log("🎉 The hash of your transaction is: ", hash);
                i = 1;
              } else {
                console.log(
                  "❗Something went wrong while submitting your transaction:",
                  error
                );
                i = 1;
              }
            }
          );
        } else {
          console.log("prob oos");
        }
      } else {
        console.log("no new listings to burn");
      }

      sleep(100);
    }
  } catch (error) {
    console.log(error)
  }
}
buy();
