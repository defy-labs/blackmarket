import {
  ApolloClient,
  from,
  createHttpLink,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  ServerError,
} from '@apollo/client'
import { onError as linkOnError } from '@apollo/client/link/error'
import environment from './environment'

const isServer = typeof window === 'undefined'
const windowApolloState = !isServer && window.__NEXT_DATA__.props.apolloState

let _client: ApolloClient<NormalizedCacheObject>

export function getContentfulClient(): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: `https://graphql.contentful.com/content/v1/spaces/${environment.CONTENTFUL_SPACE_ID}/environments/${environment.CONTENTFUL_ENVIRONMENT_ID}`,
    headers: {
      authorization: `Bearer ${environment.CONTENTFUL_ACCESS_TOKEN}`,
      'Content-Language': 'en-us',
    },
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    ssrMode: true,
  })
}

export default function getClient(
  authorization: string | null,
  forceReset = false,
  onError?: (status: number) => void,
): ApolloClient<NormalizedCacheObject> {
  if (_client && !forceReset) return _client

  const errorLink = linkOnError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      )
    if (!networkError) return
    const { statusCode } = networkError as ServerError
    if (
      statusCode === 404 || // Not found
      statusCode === 402 || // Payment required
      statusCode >= 500 || // Server error
      statusCode < 600
    )
      return onError?.(statusCode)
  })

  const httpLink = new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_LITEFLOW_BASE_URL || 'https://api.liteflow.com'
      }/${environment.LITEFLOW_API_KEY}/graphql`,
    headers: {
      ...(authorization ? { authorization: `Bearer ${authorization}` } : {}),
      origin: environment.BASE_URL,
    },
  })

  _client = new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Account: {
          keyFields: ['address'],
        },
        Asset: {
          keyFields: ['chainId', 'collectionAddress', 'tokenId'],
        },
        Collection: {
          keyFields: ['chainId', 'address'],
        },
      },
    }).restore(windowApolloState || {}),
    link: from([errorLink, httpLink]),
    ssrMode: isServer,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
    ssrForceFetchDelay: 100,
  })
  return _client
}
