import React, { useState, useEffect } from "react";
import { middleEllipsize } from "../../utils/ellipsize";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import Image from "next/image";

import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

import { formatDate, formatTime } from "./Utils";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  createColumnHelper,
  SortingState,
  FilterFn,
  getSortedRowModel,
} from "@tanstack/react-table";

type ExplorerData = {
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
};
const columnHelper = createColumnHelper<NFT>();

export default function TimelineTable(tableData: ExplorerData) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [userLocale, setUserLocale] = useState("en");
  const [userTimezone, setUserTimeZone] = useState("America/New_York");
  const columns = [
    columnHelper.accessor("projectname", {
      header: "Collection",
      cell: (info) => (
        <>
          <div className="text-gray-900">{info.row.original.projectname}</div>
          <div className="text-gray-500 flex justify-left">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://gem.xyz/collection/${info.row.original.fromcontractaddress}`}
            >
              <Image src="/gem.png" width="20" height="20" alt="gem" />
            </a>
            {info.row.original.tokenid.slice(0, 10)}
          </div>
        </>
      ),
    }),
    {
      header: "incoming",
      columns: [
        columnHelper.accessor("transfertotimestamp", {
          header: "date",
          cell: (info) => (
            <>
              <div className="text-gray-900">
                {formatDate(info.getValue(), userLocale, userTimezone)}
              </div>
              <div className="text-gray-500">
                {formatTime(info.getValue() as string, userLocale, userTimezone)}
              </div>
            </>
          ),
        }),
        columnHelper.accessor("transfertotxhash", {
          header: "counterparty",
          cell: (info) => (
            <>
              <div className="text-gray-900">
                {info.row.original.transfertotype === "Minted" ? (
                  "Minted"
                ) : (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://etherscan.io/address/${info.row.original.transferinsourceaddress}`}
                  >
                    {middleEllipsize(info.getValue() as string)}
                  </a>
                )}
              </div>
              <div className="text-gray-500">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://etherscan.io/tx/${info.getValue()}`}
                >
                  tx
                </a>
              </div>
            </>
          ),
        }),
      ],
    },
    {
      header: "outgoing",
      columns: [
        columnHelper.accessor("transferfromtxhash", {
          header: "counterparty",
          cell: (info) => (
            <>
              {!info.getValue() ? (
                ""
              ) : (
                <>
                  <div className="text-gray-900">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://etherscan.io/address/${info.getValue()}`}
                    >
                      {info.getValue() === "Minted"
                        ? "Minted"
                        : middleEllipsize(info.row.original.transferouttargetaddress)}
                    </a>
                  </div>
                  <div className="text-gray-500">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://etherscan.io/tx/${info.getValue()}`}
                    >
                      tx
                    </a>
                  </div>
                </>
              )}
            </>
          ),
        }),
        columnHelper.accessor("transferfromtimestamp", {
          id: "transferfromtimestamp",
          header: "date",
          enableGlobalFilter: false,
          cell: (info) => (
            <>
              <div className="text-gray-900">
                {formatDate(info.getValue(), userLocale, userTimezone)}
              </div>
              <div className="text-gray-500">
                {info.getValue() ? formatTime(info.getValue(), userLocale, userTimezone) : ""}
              </div>
            </>
          ),
        }),
      ],
    },
    columnHelper.accessor("transferfromtype", {
      id: "status",
      header: "status",
      enableGlobalFilter: true,
      cell: (info) => (
        <>
          <div className="text-center">
            {info.getValue() === "Burned" && <span className="inline-flex">🔥</span>}
            {info.getValue() === "N/A" && (
              <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                In wallet
              </span>
            )}
            {info.getValue() === "Transferred" && (
              <span className="inline-flex rounded-full bg-red-300 px-2 text-xs font-semibold leading-5 text-gray-600">
                Sent
              </span>
            )}
          </div>
        </>
      ),
    }),
  ];

  useEffect(() => {
    const locale =
      navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.language;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimeZone(timezone);
    setUserLocale(locale as string);
  }, []);

  const data = tableData.data;

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
  });

  const count = data.length ?? 0;

  return (
    <div className="sm:flex sm:gap-x-2">
      <div className="mt-2 flex flex-col">
        <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
            <DebouncedInput
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
              className="block  p-1 shadow border rounded-md border-gray-300  focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={
                count === 0
                  ? "loading ..."
                  : count === 1
                  ? `${count} record ...`
                  : `${count} records ...`
              }
            />
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                              header.colSpan > 1
                                ? "text-center font-extrabold text-gray-700 "
                                : null
                            }`}
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                {...{
                                  className: header.column.getCanSort()
                                    ? "cursor-pointer select-none flex items-center gap-x-1"
                                    : "",
                                  onClick: header.column.getToggleSortingHandler(),
                                }}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {{
                                  asc: <ChevronUpIcon className="h-4 w-4" />,
                                  desc: <ChevronDownIcon className="h-4 w-4" />,
                                }[header.column.getIsSorted() as string] ?? null}
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => {
                    return (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="h-2 " />
              <div className="flex justify-between items-center gap-2">
                <div>
                  <button
                    className="border rounded p-1"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>

                  <button
                    className="border rounded p-1"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <span className="flex items-center gap-1">
                  <div>Page</div>
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </strong>
                </span>
                <select
                  className="mx-1 my-1 block rounded-md border-none py-2 pl-3 pr-10 text-base focus:border-none focus:outline-none focus:ring-indigo-100 sm:text-sm"
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

interface FuzzyFunction {
  (value: string, search: string): RankingInfo;
}

const fuzzyFilter: FilterFn<FuzzyFunction> = (row, columnId, value, addMeta): boolean => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({
    itemRank,
  });

  return itemRank.passed;
};
