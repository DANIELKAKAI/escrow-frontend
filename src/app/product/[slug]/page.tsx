"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
const EscrowABIJson = require("../../../../../artifacts/contracts/EscrowV4.sol/EscrowV4.json");

const ERC20ABIJson = require("../../../../../utils/erc20.abi.json");
const { cUsdToWei, arbitorApproval } = require("../../../../../utils/utils");
import { StarIcon } from "@heroicons/react/20/solid";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { productSource } from "@/helpers/productSource";
import { arbitorAdress, escrowContractAddress, sellerAddress, cUsdAddress } from "../../../../../utils/addresses";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celoAlfajores } from "viem/chains";
import { useState } from "react";


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
function getProductData(slug: string) {
  return productSource.find((product) => product.productSlug === slug);
}

export default function ProductOverview({
  params,
}: {
  params: { slug: string };
}) {
  const selectedProduct = getProductData(params.slug);

  const [showStartButton, setShowStartButton] = useState(true)
  const [showDepositButton, setShowDepositButton] = useState(false)
  const [showApproveButton, setShowApproveButton] = useState(false)

  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
  });
  let walletClient = createWalletClient({
    transport: custom(window.ethereum),
    chain: celoAlfajores,
  });

  const handleBuyClick = async (product: any) => {
    event?.preventDefault();
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
      setShowStartButton(false);
      setShowDepositButton(true);
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const handleDepositClick = async (product) => {
    event?.preventDefault();
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
      setShowDepositButton(false);
      setShowApproveButton(true);
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const handleApproveClick = async (product) => {
    event?.preventDefault();

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
      setShowApproveButton(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery */}
          <TabGroup as="div" className="flex flex-col-reverse">
            {/* Image selector */}
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <TabList className="grid grid-cols-4 gap-6">
                {selectedProduct?.images.map((image) => (
                  <Tab
                    key={image.id}
                    className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                  >
                    {({ selected }) => (
                      <>
                        <span className="sr-only">{image.name}</span>
                        <span className="absolute inset-0 overflow-hidden rounded-md">
                          <img
                            src={image.src}
                            alt=""
                            className="h-full w-full object-cover object-center"
                          />
                        </span>
                        <span
                          className={classNames(
                            selected ? "ring-indigo-500" : "ring-transparent",
                            "pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2"
                          )}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </Tab>
                ))}
              </TabList>
            </div>

            <TabPanels className="aspect-h-1 aspect-w-1 w-full">
              {selectedProduct?.images.map((image) => (
                <TabPanel key={image.id}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover object-center sm:rounded-lg"
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {selectedProduct?.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                {selectedProduct?.price} cUSD
              </p>
            </div>

            {/* Reviews */}
            <div className="mt-3">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className={classNames(
                        3 > rating
                          ? "text-indigo-500"
                          : "text-gray-300",
                        "h-5 w-5 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="sr-only">
                  3 out of 5 stars
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>

              <div className="space-y-6 text-base text-gray-700">
                {selectedProduct?.description}
              </div>
            </div>

            <form className="mt-6">
              {/* Colors */}
              <div>
                <h3 className="text-sm text-gray-600">Color</h3>
              </div>

              <div className="sm:flex-col1 mt-10 flex">
                {showStartButton ? (
                  <button
                    type="submit"
                    onClick={() => handleBuyClick(selectedProduct)}
                    className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                  >
                    Start Escrow
                  </button>
                ) : showDepositButton ? (
                  <button
                    type="submit"
                    onClick={() => handleDepositClick(selectedProduct)}
                    className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                  >
                    Deposit to Arbiter
                  </button>
                ) : showApproveButton ? (
                  <button
                    type="submit"
                    onClick={() => handleApproveClick(selectedProduct)}
                    className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                  >
                    Approve
                  </button>
                ) : null}
              </div>

            </form>

            <section aria-labelledby="details-heading" className="mt-12">
              <h2 id="details-heading" className="sr-only">
                Additional details
              </h2>

              <div className="divide-y divide-gray-200 border-t">
                {selectedProduct?.details.map((detail) => (
                  <Disclosure as="div" key={detail.name}>
                    {({ open }) => (
                      <>
                        <h3>
                          <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                            <span
                              className={classNames(
                                open ? "text-indigo-600" : "text-gray-900",
                                "text-sm font-medium"
                              )}
                            >
                              {detail.name}
                            </span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <MinusIcon
                                  className="block h-6 w-6 text-indigo-400 group-hover:text-indigo-500"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusIcon
                                  className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </DisclosureButton>
                        </h3>
                        <DisclosurePanel
                          as="div"
                          className="prose prose-sm pb-6"
                        >
                          <ul role="list">
                            {detail.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
