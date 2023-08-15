import { MagicAuthConnector } from '@everipedia/wagmi-magic-connector'
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
import invariant from 'ts-invariant'
import { Chain, configureChains, Connector, createClient } from 'wagmi'
import {
  bsc,
  bscTestnet,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
} from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import environment from './environment'
import { theme } from './styles/theme'

const supportedChains = [
  mainnet,
  goerli,
  bscTestnet,
  bsc,
  polygon,
  polygonMumbai,
]
const activatedChains =
  environment.CHAIN_IDS.length > 0
    ? environment.CHAIN_IDS
    : [environment.CHAIN_ID]

export const { chains, provider } = configureChains<Chain>(
  activatedChains.map((x) => {
    const chain = supportedChains.find((y) => y.id === x)
    invariant(chain, `Chain ${x} is not supported`)
    return chain
  }),
  [publicProvider()],
)

// Copied from https://github.com/rainbow-me/rainbowkit/blob/main/packages/rainbowkit/src/wallets/getDefaultWallets.ts#L11
// Only added the shimDisconnect option
const getDefaultWallets = ({
  appName,
  chains,
  shimDisconnect,
}: {
  appName: string
  chains: Chain[]
  shimDisconnect?: boolean
}): {
  connectors: ReturnType<typeof connectorsForWallets>
  wallets: WalletList
} => {
  const wallets: WalletList = [
    {
      groupName: 'Popular',
      wallets: [
        environment.MAGIC_API_KEY
          ? emailConnector({
            chains,
            chainId: environment.CHAIN_ID,
            apiKey: environment.MAGIC_API_KEY,
          })
          : undefined,
        injectedWallet({ chains, shimDisconnect }),
        rainbowWallet({ chains, shimDisconnect }),
        coinbaseWallet({ appName, chains }),
        metaMaskWallet({ chains, shimDisconnect }),
        walletConnectWallet({ chains }),
        braveWallet({ chains, shimDisconnect }),
      ].filter(Boolean),
    },
  ]

  return {
    connectors: connectorsForWallets(wallets),
    wallets,
  }
}

const { connectors } = getDefaultWallets({
  appName: 'Blackmarket',
  chains,
  shimDisconnect: true,
})

export const client = createClient({
  autoConnect: true,
  provider,
  connectors: connectors,
})

function emailConnector({
  chains,
  chainId,
  apiKey,
}: {
  chains: any[]
  chainId: number
  apiKey: string
}): Wallet {
  const rpcUrl = (function () {
    switch (chainId) {
      case mainnet.id:
        return 'https://rpc.ankr.com/eth'
      case goerli.id:
        return 'https://rpc.ankr.com/eth_goerli'
      case polygon.id:
        return 'https://rpc.ankr.com/polygon'
      case polygonMumbai.id:
        return 'https://rpc.ankr.com/polygon_mumbai'
      case bsc.id:
        return 'https://rpc.ankr.com/bsc'
      case bscTestnet.id:
        return 'https://rpc.ankr.com/bsc_testnet_chapel'
    }
  })()
  invariant(rpcUrl, `no rpcUrl found for chain ${chainId}`)
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
          customHeaderText: 'Blackmarket',
          magicSdkConfiguration: {
            network: {
              rpcUrl,
              chainId,
            },
          },
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
