"use client";

require("dotenv").config();

import { useAccount } from "wagmi";

const { ethers } = require("ethers");

import WalletConnect from "./components/WalletConnect";
import ProductList from "./components/ProductList";

const TokenABIJson = require("../../../artifacts/contracts/EscrowV4.sol/EscrowV4.json");

const { cUsdToWei, arbitorApproval } = require("../../../utils/utils");

import { createPublicClient, createWalletClient, custom, http } from "viem";

import { celoAlfajores } from "viem/chains";


const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
});

function App() {
  const account = useAccount();

  const sellerAddress = "0x31B2821B611b8e07d88c9AFcb494de8E36b09537";
  const arbitorAdress = "0x141adc0e0158B4c6886534701412da2E2b0d7fF1";
  const escrowContractAddress = "0x30137D3B965E3E3E1EA28dE9C85E77383CAEf4D1";
  const cUsdAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  let walletClient = createWalletClient({
    transport: custom(window.ethereum),
    chain: celoAlfajores,
  });

  const handleBuyClick = async (product) => {
    if (typeof window.ethereum !== "undefined") {
      let [address] = await walletClient.getAddresses();

      const tx = await walletClient.writeContract({
        address: escrowContractAddress,
        abi: TokenABIJson.abi,
        functionName: "addProduct",
        account: address,
        args: [sellerAddress, arbitorAdress, product.id, cUsdToWei(product.price)],
      });

      let receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      console.log(receipt);
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const handleDepositClick = async (product) => {
    if (typeof window.ethereum !== "undefined") {
      let [address] = await walletClient.getAddresses();

      console.log(product, address);

      const tx = await walletClient.writeContract({
        address: escrowContractAddress,
        abi: TokenABIJson.abi,
        functionName: "deposit",
        account: address,
        args: [sellerAddress, product.id, cUsdToWei(product.price)],
      });

      let receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      console.log(receipt);
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const handleApproveClick = async (product) => {
    const ERC20ABIJson = require("../../../utils/erc20.abi.json");
    const cUsdAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

    const ARBITOR_PRIVATE_KEY = "b9c054b148727a388dd06cf329c5c67e37324a8085fb2893f0023d1802097754"

    // arbitor contract
    const provider = new ethers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
    const abWallet = new ethers.Wallet(ARBITOR_PRIVATE_KEY, provider);
    const abContract = new ethers.Contract(cUsdAddress, ERC20ABIJson, abWallet);

    const approveTx = await abContract.approve(
        escrowContractAddress,
        cUsdToWei(product.price)
    );

    let res = await approveTx.wait();

    console.log(res);

    try {
      let [address] = await walletClient.getAddresses();

      const tx = await walletClient.writeContract({
        address: escrowContractAddress,
        abi: TokenABIJson.abi,
        functionName: "approvedByBuyer",
        account: address,
        args: [sellerAddress, product.id],
      });

      let receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      console.log(receipt);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <WalletConnect></WalletConnect>
      <ProductList
        handleBuyClick={handleBuyClick}
        handleDepositClick={handleDepositClick}
        handleApproveClick={handleApproveClick}
      ></ProductList>
    </>
  );
}

export default App;
