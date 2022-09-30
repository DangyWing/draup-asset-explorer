import type { NextPage } from "next";
import { useState, useRef, useCallback, useEffect } from "react";
import Head from "next/head";
import { ConnectKitButton } from "connectkit";
import { useAccount, useProvider } from "wagmi";
import { ethers } from "ethers";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import TimelineTable from "../components/timelineTable/timelineTable";
import { QueryFlipside } from "../utils/queryFlipside";
import { nftTransfersQuery } from "../sql/getTransfers";
import Image from "next/image";
import Explorer from "../components/walletExplorer/explorer";
import { useAtom } from "jotai";
import { showExplorerAtom } from "../atoms";

const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const { address } = useAccount();
  const [ethAddressError, setEthAddressError] = useState("");
  const provider = useProvider();
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [searchEthAddress, setSearchEthAddress] = useState("");
  const [showExplore, setShowExplore] = useAtom(showExplorerAtom);

  const ethAddressInput = useRef<HTMLInputElement>(null);

  const handleClick = async (walletAddress: string) => {
    setIsLoading(true);

    const { data } = await QueryFlipside(nftTransfersQuery({ walletAddress }));

    const tableData = data;

    // todo: error handling
    if (tableData) {
      setData(tableData);
    }

    setIsLoading(false);
  };

  const handleKeyPress = useCallback((event: any) => {
    if (event.metaKey && event.key === "k") {
      ethAddressInput?.current?.focus();
    }
  }, []);

  useEffect(() => {
    const updateAccount = () => {
      setCurrentAccount(address ?? "");
    };

    const updateEthAddressToSearch = () => {
      setSearchEthAddress(address ?? "");
    };

    updateEthAddressToSearch();
    updateAccount();

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress, address]);

  async function setEthAddress(ethAddress: string) {
    if (!ethers.utils.isAddress(ethAddress) && !ethAddress.endsWith(".eth")) {
      setEthAddressError("Please use a valid eth address or ens"), setSearchEthAddress("");
    } else if (ethAddress.endsWith(".eth")) {
      const resolvedEthAddress = await provider.resolveName(ethAddress);
      resolvedEthAddress
        ? (setSearchEthAddress(resolvedEthAddress), setEthAddressError(""))
        : (setEthAddressError("No ENS name found for this address"), setSearchEthAddress(""));
    } else {
      setEthAddressError("");
      setSearchEthAddress(ethAddress);
    }
  }

  return (
    <>
      {data && showExplore ? (
        <Explorer data={data} />
      ) : (
        <>
          <Head>
            <title>DRAUP Take Home</title>
            <meta name="description" content="DRAUP take home task" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <div className=" mt-2 flex justify-end">
            <ConnectKitButton showAvatar={true} />
          </div>
          <main className="container mx-auto flex min-h-screen flex-col  items-center p-4">
            <h1 className="text-2xl font-bold leading-normal text-gray-700 md:text-[4rem]">
              DRAUP <span className="text-pink-300">Asset</span> Explorer
            </h1>
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                alt address
              </label>
              <div className="relative mt-1 flex items-center">
                <input
                  type="text"
                  name="search"
                  id="search"
                  placeholder={"0xdead | DRAUP.eth"}
                  defaultValue={address ?? ""}
                  ref={ethAddressInput}
                  onChange={(e) => setEthAddress(e.target.value)}
                  aria-invalid="true"
                  aria-describedby="ethAddress-error"
                  className="block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                  <kbd className="inline-flex items-center rounded border border-gray-200 px-2 font-sans text-sm font-medium text-gray-400">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>
            {ethAddressError && (
              <div className="pointer-events-none inset-y-0 right-0 flex items-center pr-3">
                <p className="mt-2 text-sm text-red-600" id="ethAddress-error">
                  {ethAddressError ?? " invalid eth address"}
                </p>
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            <div className="mt-2">
              {currentAccount && (
                <button
                  onClick={() => handleClick(currentAccount)}
                  className="mx-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <>
                      <span className="text-purple-300">load</span>ing my&nbsp;
                      <span className="text-purple-300">assets</span>
                    </>
                  ) : (
                    <>
                      load&nbsp;<span className="text-purple-300">my</span>&nbsp;assets
                    </>
                  )}
                  <PaperAirplaneIcon className="-mr-0.5 ml-2 h-4 w-4" aria-hidden="true" />
                </button>
              )}
              {searchEthAddress && (
                <button
                  onClick={() => handleClick(searchEthAddress)}
                  disabled={!searchEthAddress}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <>
                      <span className="text-purple-300">load</span>ing their&nbsp;
                      <span className="text-purple-300">assets</span>
                    </>
                  ) : (
                    <>
                      load&nbsp;<span className="text-purple-300">their</span>&nbsp;assets
                    </>
                  )}
                  <PaperAirplaneIcon className="-mr-0.5 ml-2 h-4 w-4" aria-hidden="true" />
                </button>
              )}
              {data && (
                <button
                  onClick={() => setShowExplore(true)}
                  className="mx-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  explore
                </button>
              )}
              {isLoading && (
                <div className="m-1 flex justify-center ">
                  <Image src="/PacmanLoading.gif" alt="loading" width={75} height={75} />
                </div>
              )}
            </div>
            {data && !showExplore && <TimelineTable data={data} />}
          </main>
        </>
      )}
    </>
  );
};

export default Home;
