import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config } from "./wagmi.ts";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
                <HelmetProvider>
                    <App />
                </HelmetProvider>
            </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
);
