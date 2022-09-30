import { useEffect, useState } from "react";
import ThreePointVis from "./ThreePointVis.js";
import { DateTime } from "luxon";
import { DebounceInput } from "react-debounce-input";
import { QueryResultRecord } from "@flipsidecrypto/sdk";
import { useAtom } from "jotai";
import { showExplorerAtom, userLocaleAtom, userTimezoneAtom } from "../../atoms";

type ExplorerData = {
  data: QueryResultRecord[];
};

export default function App(tableData: ExplorerData) {
  const [layout, setLayout] = useState("grid");
  const [selectedPoint, setSelectedPoint] = useState({
    projectname: "",
    tokenid: null,
    mint_price_eth: null,
    mint_price_usd: null,
    mint_tx_fee: null,
    transferfromtimestamp: null,
    transfertotimestamp: null,
  });
  const [selectedDate, setSelectedDate] = useState(1612595597 / 84000);
  const [minTimestamp, setMinTimestamp] = useState(1632460349);
  const [maxTimestamp, setMaxTimestamp] = useState(1642460349);
  const [, setShowExplore] = useAtom(showExplorerAtom);
  const [userLocale] = useAtom(userLocaleAtom);
  const [userTimezone] = useAtom(userTimezoneAtom);

  const data = tableData.data;

  type tableData = {
    data: NFT[];
  };

  type NFT = {
    fromaddress: string;
    fromcontractaddress: string;
    projectname: string;
    tokenid: string;
    transferfromtimestamp: string;
    transferfromtxhash: string;
    transferfromtype: string;
    transferinsourceaddress: string;
    transferouttargetaddress: string;
    transfertotimestamp: string;
    transfertotxhash: string;
    transfertotype: string;
    mint_price_eth: string;
    mint_tx_fee_eth: string;
    token_metadta: string;
  };

  useEffect(() => {
    function findDateRangeOfTransfers(resultData: NFT[]) {
      const cleanDates = resultData.filter(
        (result) =>
          typeof result.transfertotimestamp === "string" &&
          typeof result.transferfromtimestamp === "string" &&
          result.transfertotimestamp != null &&
          result.transferfromtimestamp != null
      );

      const max = Math.max(
        ...cleanDates.map((result) =>
          DateTime.fromSQL(result.transferfromtimestamp.toString()).toSeconds()
        )
      );

      const min = Math.min(
        ...cleanDates.map((result) =>
          DateTime.fromSQL(result.transfertotimestamp.toString()).toSeconds()
        )
      );
      // move the minimum back 3 days
      setMinTimestamp(min);
      // move the maximum forward 3 days
      setMaxTimestamp(max + 259200);
    }

    findDateRangeOfTransfers(data as []);
  }, [data]);

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = parseInt(e.target.value);

    setSelectedDate(value);
  }

  return (
    <div>
      <div className="vis-container">
        <ThreePointVis
          data={data}
          layout={layout}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
          targetDate={selectedDate}
        />
      </div>
      <div className="flex justify-between">
        <div className="z-1 relative m-2 max-h-40 w-64 rounded-md bg-gray-500 p-5 text-sky-100">
          <div className="flex w-full justify-evenly">
            <button
              onClick={() => setLayout("grid")}
              className={`mx-1 rounded-lg bg-gray-800 p-1 uppercase text-sky-200 hover:bg-black hover:text-pink-200 ${
                layout === "grid" ? "bg-black font-bold text-pink-200" : ""
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setLayout("spiral")}
              className={`mx-1 rounded-lg bg-gray-800 p-1 uppercase text-sky-200 hover:bg-black hover:text-pink-200 ${
                layout === "spiral" ? "bg-black font-bold text-pink-200" : ""
              }`}
            >
              Spiral
            </button>
          </div>

          <p>
            view as of:{" "}
            {DateTime.fromSeconds(selectedDate * 86400)
              .setLocale(userLocale)
              .setZone(userTimezone)
              .toLocaleString()}
          </p>
          <DebounceInput
            id="dateSlider"
            type="range"
            min={minTimestamp / 86400}
            max={maxTimestamp / 86400}
            value={selectedDate}
            onChange={handleSliderChange}
            step="1"
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-pink-200 dark:bg-gray-600"
          />
          <div className="flex justify-center">
            <button
              onClick={() => setShowExplore(false)}
              className={`mx-1 rounded-lg bg-gray-900 p-1 uppercase text-sky-200 hover:bg-black hover:text-pink-200 `}
            >
              Home
            </button>
          </div>
        </div>
        {selectedPoint.projectname && (
          <div className="z-1 relative m-2 w-80 rounded-md bg-gray-500 p-5 text-sky-100">
            <div className="selected-point">
              <p className="text-zinc-100">
                collection: <strong>{selectedPoint.projectname}</strong>
              </p>
              {selectedPoint.tokenid && (
                <p className="text-zinc-100">
                  token id: <strong>{selectedPoint?.tokenid.slice(0, 10)}</strong>
                </p>
              )}
              <p className="text-zinc-100">
                mint price (ETH):{" "}
                <strong>{parseFloat(Number(selectedPoint.mint_price_eth).toFixed(5))}</strong>
              </p>
              <p className="text-zinc-100">
                mint price (USD):{" "}
                <strong>{parseFloat(Number(selectedPoint.mint_price_usd).toFixed(5))}</strong>
              </p>
              <p className="text-zinc-100">
                mint tx fee (ETH):{" "}
                <strong>{parseFloat(Number(selectedPoint.mint_tx_fee).toFixed(5))}</strong>
              </p>
              <p>
                entered wallet:{" "}
                <strong>
                  {DateTime.fromSQL(selectedPoint.transfertotimestamp)
                    .setLocale(userLocale)
                    .setZone(userTimezone)
                    .toLocaleString()}
                </strong>
              </p>
              <p>
                left wallet:{" "}
                {!selectedPoint.transferfromtimestamp ? (
                  <></>
                ) : (
                  <strong>
                    {DateTime.fromSQL(selectedPoint.transferfromtimestamp)
                      .setLocale(userLocale)
                      .setZone(userTimezone)
                      .toLocaleString()}
                  </strong>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
