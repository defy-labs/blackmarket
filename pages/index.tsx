import {
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import CollectionCard from 'components/Collection/Card'
import {
  ContentfulHomePageDocument,
  ContentfulHomePageQuery,
  TokenCollection,
} from 'contentful-graphql'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { wrapServerSideProps } from 'props'
import { useCallback, useEffect, useMemo } from 'react'
import Link from '../components/Link/Link'
import Loader from '../components/Loader'
import Slider from '../components/Slider/Slider'
import TokenCard from '../components/Token/Card'
import TokenHeader from '../components/Token/Header'
import {
  convertAsset,
  convertAssetWithSupplies,
  convertAuctionFull,
  convertAuctionWithBestBid,
  convertBid,
  convertOwnership,
  convertSale,
  convertSaleFull,
  convertUser,
} from '../convert'
import environment from '../environment'
import {
  FetchDefaultAssetIdsDocument,
  FetchDefaultAssetIdsQuery,
  FetchHomePageDocument,
  FetchHomePageQuery,
  useFetchDefaultAssetIdsQuery,
  useFetchHomePageQuery,
} from '../graphql'
import useAccount from '../hooks/useAccount'
import useOrderById from '../hooks/useOrderById'
import useSigner from '../hooks/useSigner'
import LargeLayout from '../layouts/large'

type Props = {
  now: string
  featuredTokens: string[]
  featuredCollections: TokenCollection[]
  limit: number
  tokens: string[]
  currentAccount: string | null
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client, contentfulClient) => {
    const now = new Date()
    let tokensToRender
    if (environment.HOME_TOKENS) {
      // Randomize list of assets to display
      tokensToRender = environment.HOME_TOKENS.sort(
        () => Math.random() - 0.5,
      ).slice(0, environment.PAGINATION_LIMIT)
    } else {
      // Fallback to default list of assets
      const res = await client.query<FetchDefaultAssetIdsQuery>({
        query: FetchDefaultAssetIdsDocument,
        variables: {
          limit: environment.PAGINATION_LIMIT,
        },
      })
      tokensToRender = res.data.assets?.nodes.map((x) => x.id) || []
    }

    const contentfulResponse =
      await contentfulClient?.query<ContentfulHomePageQuery>({
        query: ContentfulHomePageDocument,
      })

    const { data, error } = await client.query<FetchHomePageQuery>({
      query: FetchHomePageDocument,
      variables: {
        featuredIds: contentfulResponse?.data?.homePage?.featuredTokens,
        now,
        limit: environment.PAGINATION_LIMIT,
        assetIds: tokensToRender,
        address: ctx.user.address || '',
      },
    })

    if (error) throw error
    if (!data) throw new Error('data is falsy')

    return {
      props: {
        now: now.toJSON(),
        limit: environment.PAGINATION_LIMIT,
        featuredTokens: contentfulResponse?.data.homePage
          ?.featuredTokens as string[],
        featuredCollections:
          (contentfulResponse?.data?.homePage?.featuredCollectionsCollection
            ?.items as TokenCollection[]) || [],
        tokens: tokensToRender,
        currentAccount: ctx.user.address,
      },
    }
  },
)

const HomePage: NextPage<Props> = ({ featuredCollections, featuredTokens, now }) => {
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { address } = useAccount()
  const toast = useToast()
  const date = useMemo(() => new Date(now), [now])
  const { data: tokensToRender } = useFetchDefaultAssetIdsQuery({
    variables: { limit: environment.PAGINATION_LIMIT },
    skip: !!environment.HOME_TOKENS,
  })

  const assetIds = useMemo(() => {
    if (environment.HOME_TOKENS) {
      // Pseudo randomize the array based on the date's seconds
      const tokens = [...environment.HOME_TOKENS]

      const seed = date.getTime() / 1000 // convert to seconds as date is currently truncated to the second
      const randomTokens = []
      while (
        tokens.length &&
        randomTokens.length < environment.PAGINATION_LIMIT
      ) {
        // generate random based on seed and length of the remaining tokens array
        // It will change when seed changes (basically every request) and also on each iteration of the loop as length of tokens changes
        const randomIndex = seed % tokens.length
        // remove the element from tokens
        const element = tokens.splice(randomIndex, 1)
        // push the element into the returned array in order
        randomTokens.push(...element)
      }
      return randomTokens
    }
    return (tokensToRender?.assets?.nodes || []).map((x) => x.id)
  }, [tokensToRender, date])

  const { data, refetch, error, loading } = useFetchHomePageQuery({
    variables: {
      featuredIds: featuredTokens,
      now: date,
      limit: environment.PAGINATION_LIMIT,
      assetIds: assetIds,
      address: address || '',
    },
  })

  useEffect(() => {
    if (!error) return
    console.error(error)
    toast({
      title: t('error.500'),
      status: 'error',
    })
  }, [error, t, toast])

  const featured = useOrderById(featuredTokens ?? [], data?.featured?.nodes)
  const assets = useOrderById(assetIds, data?.assets?.nodes)
  const currencies = useMemo(() => data?.currencies?.nodes || [], [data])
  const auctions = useMemo(() => data?.auctions?.nodes || [], [data])

  const reloadInfo = useCallback(async () => {
    void refetch()
  }, [refetch])

  const featuredAssets = useMemo(
    () =>
      featured?.map((asset) => (
        <TokenHeader
          key={asset.id}
          asset={convertAssetWithSupplies(asset)}
          currencies={currencies}
          auction={
            asset.auctions.nodes[0]
              ? convertAuctionFull(asset.auctions.nodes[0])
              : undefined
          }
          bestBid={
            asset.auctions.nodes[0]?.bestBid?.nodes[0]
              ? convertBid(asset.auctions.nodes[0]?.bestBid?.nodes[0])
              : undefined
          }
          sales={asset.sales.nodes.map(convertSaleFull)}
          creator={convertUser(asset.creator, asset.creator.address)}
          owners={asset.ownerships.nodes.map(convertOwnership)}
          numberOfOwners={asset.ownerships.totalCount}
          isHomepage={true}
          signer={signer}
          currentAccount={address}
          onOfferCanceled={reloadInfo}
          onAuctionAccepted={reloadInfo}
        />
      )),
    [featured, address, signer, reloadInfo, currencies],
  )

  if (loading) return <Loader fullPage />

  return (
    <LargeLayout>
      {featuredAssets && featuredAssets.length > 0 && (
        <header>
          {featuredAssets.length === 1 ? (
            featuredAssets
          ) : (
            <Flex as={Slider} showNavigation>
              {featuredAssets}
            </Flex>
          )}
        </header>
      )}

      {featuredCollections && featuredCollections.length > 0 && (
        <Stack spacing={6} mt={12}>
          <Flex flexWrap="wrap" justify="space-between" gap={4}>
            <Heading as="h2" variant="subtitle" color="brand.black">
              {t('home.collections')}
            </Heading>
          </Flex>

          <SimpleGrid spacing={6} columns={{ sm: 2, md: 3 }}>
            {featuredCollections
              .filter((c) => c)
              .map((collection, i) => (
                <Flex key={i} justify="center">
                  <CollectionCard
                    image={collection.featureImage?.url || ''}
                    title={collection.name || ''}
                    collectionAddress={collection.collectionAddress || ''}
                  />
                </Flex>
              ))}
          </SimpleGrid>
        </Stack>
      )}

      {auctions.length > 0 && (
        <Stack spacing={6} mt={12}>
          <Heading as="h2" variant="subtitle" color="brand.black">
            {t('home.auctions')}
          </Heading>
          <Slider>
            {auctions.map((x, i) => (
              <Flex
                key={i}
                grow={0}
                shrink={0}
                basis={{
                  base: '100%',
                  sm: '50%',
                  md: '33.33%',
                  lg: '25%',
                }}
                p="10px"
                overflow="hidden"
              >
                <TokenCard
                  asset={convertAsset(x.asset)}
                  creator={convertUser(
                    x.asset.creator,
                    x.asset.creator.address,
                  )}
                  auction={convertAuctionWithBestBid(x)}
                  sale={undefined}
                  numberOfSales={0}
                  hasMultiCurrency={false}
                />
              </Flex>
            ))}
          </Slider>
        </Stack>
      )}

      {assets.length > 0 && (
        <Stack spacing={6} mt={12}>
          <Flex flexWrap="wrap" justify="space-between" gap={4}>
            <Heading as="h2" variant="subtitle" color="brand.black">
              {t('home.featured')}
            </Heading>
            <Link href="/explore">
              <Button
                variant="outline"
                colorScheme="gray"
                rightIcon={<Icon as={HiArrowNarrowRight} h={5} w={5} />}
                iconSpacing="10px"
              >
                <Text as="span" isTruncated>
                  {t('home.explore')}
                </Text>
              </Button>
            </Link>
          </Flex>
          <SimpleGrid spacing={6} columns={{ sm: 2, md: 3, lg: 4 }}>
            {assets.map((x, i) => (
              <Flex key={i} justify="center" overflow="hidden">
                <TokenCard
                  asset={convertAsset(x)}
                  creator={convertUser(x.creator, x.creator.address)}
                  sale={convertSale(x.firstSale.nodes[0])}
                  auction={
                    x.auctions.nodes[0]
                      ? convertAuctionWithBestBid(x.auctions.nodes[0])
                      : undefined
                  }
                  numberOfSales={x.firstSale.totalCount}
                  hasMultiCurrency={
                    parseInt(
                      x.currencySales.aggregates?.distinctCount?.currencyId,
                      10,
                    ) > 1
                  }
                />
              </Flex>
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </LargeLayout>
  )
}

export default HomePage
