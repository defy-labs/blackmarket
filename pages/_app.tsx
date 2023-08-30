import { ApolloProvider } from '@apollo/client'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { Box, Button, ChakraProvider, Flex, Link } from '@chakra-ui/react'
import { LiteflowProvider } from '@liteflow/react'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import dayjs from 'dayjs'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import App from 'next/app'
import { useRouter } from 'next/router'
import { GoogleAnalytics, usePageViews } from 'nextjs-google-analytics'
import NProgress from 'nprogress'
import { Helmet } from 'react-helmet'
import transakSDK from '@transak/transak-sdk'
import 'nprogress/nprogress.css'
import React, {
  ComponentType,
  Fragment,
  JSX,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Cookies, CookiesProvider } from 'react-cookie'
import {
  WagmiConfig,
  useDisconnect,
  useAccount as useWagmiAccount,
} from 'wagmi'
import getClient from '../client'
import Footer from '../components/Footer/Footer'
import Head from '../components/Head'
import Navbar from '../components/Navbar/Navbar'
import { chains, client } from '../connectors'
import environment from '../environment'
import useAccount, { COOKIES, COOKIE_JWT_TOKEN } from '../hooks/useAccount'
import { theme } from '../styles/theme'
import Error from './_error'
require('dayjs/locale/ja')
require('dayjs/locale/zh-cn')
require('dayjs/locale/es-mx')

NProgress.configure({ showSpinner: false })

function Layout({ children }: PropsWithChildren<{}>) {
  const router = useRouter()
  const { address } = useAccount()
  const userProfileLink = useMemo(
    () => (address ? `/users/${address}` : '/login'),
    [address],
  )
  const footerLinks = useMemo(() => {
    const texts = {
      en: {
        explore: 'Explore',
        create: 'Create',
        profile: 'Profile',
        referral: 'Referral',
        support: 'Support',
        terms: 'Terms',
        privacy: 'Privacy',
        about: 'About',
        bridge: 'Token Bridge',
        twitter: 'Twitter',
        discord: 'Discord',
      },
      ja: {
        explore: '検索',
        create: '作成',
        profile: 'プロフィール',
        referral: '紹介',
        support: 'サポート',
        terms: '利用規約',
        privacy: 'プライバシーポリシー',
        about: 'About',
        bridge: 'Token Bridge',
        twitter: 'Twitter',
        discord: 'Discord',
      },
      'zh-cn': {
        explore: '探讨',
        create: '创造',
        profile: '资料',
        referral: '转介',
        support: '支持',
        terms: '条款',
        privacy: '隐私',
        about: 'About',
        bridge: 'Token Bridge',
        twitter: 'Twitter',
        discord: 'Discord',
      },
      'es-mx': {
        explore: 'Explorar',
        create: 'Crear',
        profile: 'Perfil',
        referral: 'Recomendación',
        support: 'Apoyo',
        terms: 'Letra chica',
        privacy: 'Privacidad',
        about: 'About',
        bridge: 'Token Bridge',
        twitter: 'Twitter',
        discord: 'Discord',
      },
    }
    const locale = (router.locale || 'en') as keyof typeof texts
    return [
      { href: '/explore', label: texts[locale].explore },
      { href: userProfileLink, label: texts[locale].profile },
      { href: 'mailto:support@defylabs.xyz', label: texts[locale].support },
      { href: 'https://defydisrupt.io/', label: texts[locale].about },
      { href: 'https://bridge.defydisrupt.io/', label: texts[locale].bridge },
      { href: 'https://defydisrupt.io/terms/', label: texts[locale].terms },
      { href: 'https://defydisrupt.io/privacy/', label: texts[locale].privacy },
      {
        href: 'https://twitter.com/defydisrupt/',
        label: texts[locale].twitter,
      },
      { href: 'https://discord.gg/defydisrupt', label: texts[locale].discord },
    ].filter(Boolean)
  }, [router.locale, userProfileLink])

  const launchTransakWidget = () => {
    if (!environment.TRANSAK_API_KEY) return

    const transak = new transakSDK({
      apiKey: environment.TRANSAK_API_KEY, // (Required)
      environment: 'PRODUCTION', // (Required)
      network: 'polygon',
      cryptoCurrencyCode: 'MATIC',
      walletAddress: address,
      widgetHeight: '100%',
      // .....
      // For the full list of customisation options check the link above
    })

    transak.init()

    // To get all the events
    transak.on(transak.ALL_EVENTS, (data) => {
      console.log(data)
    })

    // This will trigger when the user closed the widget
    transak.on('TRANSAK_WIDGET_CLOSE', (orderData) => {
      console.log(orderData)
      transak.close()
    })

    // This will trigger when the user marks payment is made
    transak.on('TRANSAK_ORDER_SUCCESSFUL', (orderData) => {
      console.log(orderData)
      transak.close()
    })
  }

  return (
    <Box>
      <Helmet>
        <script
          async
          src="https://widgets.coingecko.com/coingecko-coin-price-marquee-widget.js"
        ></script>
        <style>
          {`
            #transak_modal {
              height: 60%
            }  
          `}
        </style>
      </Helmet>
      <Navbar
        multiLang={{
          locale: router.locale,
          pathname: router.pathname,
          choices: [
            { label: 'En', value: 'en' },
            { label: '日本語', value: 'ja' },
            { label: '中文', value: 'zh-cn' },
            { label: 'Spanish', value: 'es-mx' },
          ],
        }}
      />
      <Flex
        mx="auto"
        mt={4}
        gap={{ base: 3, lg: 6 }}
        direction={{ base: 'column', md: 'row' }}
        px={{ base: 6, lg: 8 }}
        maxW="7xl"
        alignItems="center"
      >
        <Flex maxW="100%" overflow="hidden">
          {React.createElement('coingecko-coin-price-marquee-widget', {
            'coin-ids': 'defy,ethereum',
            currency: 'usd',
            locale: 'en',
            'background-color': '#ffffff',
            style: { width: '100%' },
          })}
        </Flex>

        <Flex
          align="center"
          flexWrap={{ base: 'wrap', md: 'nowrap' }}
          gap={{ base: 3, lg: 6 }}
          justifyContent="flex-end"
        >
          <Button
            onClick={() => {
              launchTransakWidget()
            }}
          >
            Buy MATIC
          </Button>

          <Link
            href="https://www.bybit.com/en-US/trade/spot/DEFY/USDT"
            isExternal
          >
            <Button>Buy $DEFY</Button>
          </Link>
        </Flex>
      </Flex>
      {children}
      <Flex justifyContent={'center'}>
        <script
          async
          src="https://widgets.coingecko.com/coingecko-coin-price-chart-widget.js"
        ></script>
        {React.createElement('coingecko-coin-price-chart-widget', {
          'coin-id': 'defy',
          currency: 'usd',
          height: '300',
          width: '400',
          locale: 'en',
          'background-color': '#ffffff',
        })}
      </Flex>
      <Footer name={environment.META_COMPANY_NAME} links={footerLinks} />
    </Box>
  )
}

function AccountProvider({
  children,
  onError,
}: PropsWithChildren<{ onError: (code: number) => void }>) {
  const { login, jwtToken, logout } = useAccount()
  const { disconnect } = useDisconnect()

  const { connector } = useWagmiAccount({
    async onConnect({ connector }) {
      if (!connector) return
      try {
        await login(connector)
      } catch (e: any) {
        disconnect()
      }
    },
    onDisconnect() {
      void logout()
    },
  })

  // handle change of account
  useEffect(() => {
    if (!connector) return
    const handleLogin = () => login(connector)
    connector.on('change', handleLogin)
    return () => {
      connector.off('change', handleLogin)
    }
  }, [connector, login])

  const client = useMemo(
    // The client needs to be reset when the jwtToken changes but only on the client as the server will
    // always have the same token and will rerender this app multiple times and needs to preserve the cache
    () => getClient(jwtToken, typeof window !== 'undefined', onError),
    [jwtToken, onError],
  )

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export type MyAppProps = { jwt: string | null; now: Date }

function MyApp({ Component, pageProps }: AppProps<MyAppProps>): JSX.Element {
  const [errorCode, setErrorCode] = useState<number>()
  const router = useRouter()
  dayjs.locale(router.locale)
  usePageViews()

  useEffect(() => {
    const handleStart = () => NProgress.start()
    const handleStop = () => NProgress.done()

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  if (environment.BUGSNAG_API_KEY) {
    Bugsnag.start({
      apiKey: environment.BUGSNAG_API_KEY,
      plugins: [new BugsnagPluginReact(React)],
    })
  }
  const ErrorBoundary = environment.BUGSNAG_API_KEY
    ? (Bugsnag.getPlugin('react')?.createErrorBoundary(React) as ComponentType)
    : Fragment

  const cookies =
    typeof window === 'undefined'
      ? new Cookies({ [COOKIE_JWT_TOKEN]: pageProps.jwt } as COOKIES)
      : undefined

  return (
    <ErrorBoundary>
      <Head
        title={environment.META_TITLE}
        description={environment.META_DESCRIPTION}
      >
        <meta name="keywords" content={environment.META_KEYWORDS} />

        <meta name="author" content={environment.META_COMPANY_NAME} />
        <meta name="application-name" content={environment.META_TITLE} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={environment.BASE_URL} />

        <meta name="twitter:card" content="summary" />
      </Head>
      <GoogleAnalytics strategy="lazyOnload" />
      <WagmiConfig config={client}>
        <RainbowKitProvider
          chains={chains}
          theme={lightTheme({
            accentColor: theme.colors.brand[500],
            borderRadius: 'medium',
          })}
        >
          <CookiesProvider cookies={cookies}>
            <ChakraProvider theme={theme}>
              <LiteflowProvider
                apiKey={environment.LITEFLOW_API_KEY}
                endpoint={process.env.NEXT_PUBLIC_LITEFLOW_BASE_URL}
              >
                <AccountProvider onError={setErrorCode}>
                  <Layout>
                    {errorCode ? (
                      <Error statusCode={errorCode} />
                    ) : (
                      <Component {...pageProps} />
                    )}
                  </Layout>
                </AccountProvider>
              </LiteflowProvider>
            </ChakraProvider>
          </CookiesProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </ErrorBoundary>
  )
}

MyApp.getInitialProps = async (
  appContext: AppContext & {
    ctx: {
      req?: { cookies?: COOKIES }
    }
  },
): Promise<AppInitialProps<MyAppProps>> => {
  const initialProps = (await App.getInitialProps(
    appContext,
  )) as AppInitialProps<{}> // force type of props to empty object instead of any so TS will properly require MyAppProps to be returned by this function
  const jwt = appContext.ctx.req?.cookies?.[COOKIE_JWT_TOKEN] || null
  // Generate the now time, rounded to the second to avoid re-rendering on the client
  // TOFIX: find a better way to share the time between the app and document
  const now = new Date(Math.floor(Date.now() / 1000) * 1000)
  return {
    ...initialProps,
    pageProps: {
      ...initialProps.pageProps,
      jwt,
      now,
    },
  }
}

export default MyApp
