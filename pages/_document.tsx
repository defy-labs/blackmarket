// eslint-disable-next-line @next/next/no-document-import-in-page
import { NormalizedCacheObject } from '@apollo/client'
import { getDataFromTree } from '@apollo/client/react/ssr'
import { AppInitialProps } from 'next/app'
import Document, {
  DocumentContext,
  DocumentInitialProps,
  DocumentProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'
import { ComponentType, ReactElement } from 'react'
import invariant from 'ts-invariant'
import getClient from '../client'
import { COOKIES, COOKIE_JWT_TOKEN } from '../hooks/useAccount'
import { MyAppProps } from './_app'

type MyDocumentProps = { apolloState: NormalizedCacheObject }

class MyDocument extends Document {
  constructor(props: DocumentProps & MyDocumentProps) {
    super(props)

    const { __NEXT_DATA__, apolloState } = props
    __NEXT_DATA__.props.apolloState = apolloState
  }

  render(): ReactElement {
    return (
      <Html lang={this.props.locale || 'en'}>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }

  static async getInitialProps(
    context: DocumentContext & {
      req?: { cookies?: COOKIES }
    },
  ): Promise<DocumentInitialProps & MyDocumentProps> {
    invariant(context.req)
    const jwt = context.req?.cookies?.[COOKIE_JWT_TOKEN] || null
    // the `getClient` needs to be reset on every request as early as possible and before any rendering
    const apolloClient = getClient(jwt, true)
    // Generate the now time, rounded to the second to avoid re-rendering on the client
    // TOFIX: find a better way to share the time between the app and document
    const now = new Date(Math.floor(Date.now() / 1000) * 1000)
    // properly type the AppTree with the props from MyApp
    const AppTree = context.AppTree as typeof context.AppTree &
      ComponentType<AppInitialProps<MyAppProps>>
    // This renders the page and wait for all requests to be resolved
    await getDataFromTree(<AppTree pageProps={{ jwt, now }} />) // This `defaultGetInitialProps` should be as late as possible and after the data are resolved by `getDataFromTree`
    const initialProps = await context.defaultGetInitialProps(context)
    return {
      ...initialProps,
      apolloState: apolloClient.extract(),
    }
  }
}

export default MyDocument
