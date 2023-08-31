import { MagicAuthConnector } from '@magiclabs/wagmi-connector'
import {
  connectorsForWallets,
  Wallet,
  WalletList,
} from '@rainbow-me/rainbowkit'
import {
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { Chain, configureChains, Connector, createConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import environment from './environment'
import { theme } from 'styles/theme'

const providers = [publicProvider()]
// add alchemy provider as fallback if ALCHEMY_API_KEY is set
if (environment.ALCHEMY_API_KEY)
  providers.push(alchemyProvider({ apiKey: environment.ALCHEMY_API_KEY }))

export const { chains, publicClient } = configureChains<Chain>(
  environment.CHAINS,
  providers,
)

// Copied from https://github.com/rainbow-me/rainbowkit/blob/main/packages/rainbowkit/src/wallets/getDefaultWallets.ts#L11
// Only added the shimDisconnect option
const getDefaultWallets = ({
  appName,
  chains,
  projectId,
  shimDisconnect,
}: {
  appName: string
  chains: Chain[]
  projectId: string
  shimDisconnect?: boolean
}): {
  connectors: ReturnType<typeof connectorsForWallets>
  wallets: WalletList
} => {
  const wallets: WalletList = [
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet({ chains, shimDisconnect }),
        rainbowWallet({ chains, projectId, shimDisconnect }),
        coinbaseWallet({ appName, chains }),
        metaMaskWallet({ chains, projectId, shimDisconnect }),
        walletConnectWallet({ chains, projectId }),
        braveWallet({ chains, shimDisconnect }),
        environment.MAGIC_API_KEY
          ? emailConnector({ chains, apiKey: environment.MAGIC_API_KEY })
          : undefined,
      ].filter(Boolean),
    },
  ]

  return {
    connectors: connectorsForWallets(wallets),
    wallets,
  }
}

const { connectors } = getDefaultWallets({
  appName: environment.META_TITLE,
  projectId: environment.WALLET_CONNECT_PROJECT_ID,
  chains,
  shimDisconnect: true,
})

export const client = createConfig({
  autoConnect: true,
  connectors: connectors,
  publicClient,
})

function emailConnector({
  chains,
  apiKey,
}: {
  chains: any[]
  apiKey: string
}): Wallet {
  return {
    id: 'magic',
    name: 'DEFY App',
    iconUrl: '/defy.jpg',
    iconBackground: '#fff',
    createConnector: () => {
      const connector = new MagicAuthConnector({
        chains: chains,
        options: {
          apiKey: apiKey,
          accentColor: theme.colors.brand[500],
          customHeaderText: 'DEFY App',
          customLogo: '/defy.jpg',
          oauthOptions: {
            providers: ['facebook', 'google', 'twitter', 'discord', 'apple'],
            callbackUrl: 'https://blackmarket.defydisrupt.io',
          },
        },
      }) as unknown as Connector
      return {
        connector,
      }
    },
  }
}
