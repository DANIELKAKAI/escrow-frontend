"use client";

require("dotenv").config();

import { useAccount } from "wagmi";

const { ethers } = require("ethers");

import WalletConnect from "./components/WalletConnect";
import ProductList from "./components/ProductList";

const EscrowABIJson = require("../../../artifacts/contracts/EscrowV4.sol/EscrowV4.json");

const ERC20ABIJson = require("../../../utils/erc20.abi.json");

const { cUsdToWei, arbitorApproval } = require("../../../utils/utils");

import { createPublicClient, createWalletClient, custom, http } from "viem";

import { celoAlfajores } from "viem/chains";

import { sellerAddress, arbitorAdress, escrowContractAddress, cUsdAddress} from "../../../utils/addresses";


const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
});

function App() {
  const account = useAccount();

  let walletClient = createWalletClient({
    transport: custom(window.ethereum),
    chain: celoAlfajores,
  });

  const handleBuyClick = async (product) => {
    if (typeof window.ethereum !== "undefined") {
      let [address] = await walletClient.getAddresses();

      const tx = await walletClient.writeContract({
        address: escrowContractAddress,
        abi: EscrowABIJson.abi,
        functionName: "addProduct",
        account: address,
        args: [sellerAddress, arbitorAdress, product.id, cUsdToWei(product.price)],
      });

      let receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      console.log(receipt);

      alert(`${product.name} enlisted for Escrow`);
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const handleDepositClick = async (product) => {
    if (typeof window.ethereum !== "undefined") {
      let [address] = await walletClient.getAddresses();

      const approveTx = await walletClient.writeContract({
        address: cUsdAddress,
        abi: ERC20ABIJson,
        functionName: "approve",
        account: address,
        args: [escrowContractAddress, cUsdToWei(product.price)],
      });

      let approveReceipt = await publicClient.waitForTransactionReceipt({
        hash: approveTx,
      });

      console.log(approveReceipt);

      const tx = await walletClient.writeContract({
        address: escrowContractAddress,
        abi: EscrowABIJson.abi,
        functionName: "deposit",
        account: address,
        args: [sellerAddress, product.id, cUsdToWei(product.price)],
      });

      let receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      console.log(receipt);
      alert("Funds sent to arbitor");
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const handleApproveClick = async (product) => {

    await arbitorApproval(product.price);

    try {
      let [address] = await walletClient.getAddresses();

      const tx = await walletClient.writeContract({
        address: escrowContractAddress,
        abi: EscrowABIJson.abi,
        functionName: "approvedByBuyer",
        account: address,
        args: [sellerAddress, product.id],
      });

      let receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      console.log(receipt);
      alert("Escrow deal approved, funds sent to seller");
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
