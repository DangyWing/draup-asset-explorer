import type { AppType } from "next/app";
import { WagmiConfig, createClient, configureChains, chain } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import "../styles/globals.css";
import { Provider } from "jotai";

const { provider, chains } = configureChains(
  [chain.mainnet],
  [
    jsonRpcProvider({
      rpc: () => {
        return {
          http: "https://rpc.ankr.com/eth",
        };
      },
    }),
    publicProvider(),
  ]
);

const client = createClient(
  getDefaultClient({
    appName: process.env.APP_NAME ?? "Draup Asset Explorer",
    chains,
    provider,
  })
);

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <Provider>
      <WagmiConfig client={client}>
        <ConnectKitProvider>
          <Component {...pageProps} />
        </ConnectKitProvider>
      </WagmiConfig>
    </Provider>
  );
};

export default MyApp;
