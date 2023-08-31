import {
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo, useState } from 'react'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../convert'
import environment from '../../environment'
import {
  useFetchAssetsQuery,
  useFetchDefaultAssetIdsQuery,
} from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import { useOrderByKey } from '../../hooks/useOrderByKey'
import Link from '../Link/Link'
import SkeletonGrid from '../Skeleton/Grid'
import SkeletonTokenCard from '../Skeleton/TokenCard'
import TokenCard from '../Token/Card'
import { getContentfulClient } from 'client'
import { ContentfulHomePageDocument, ContentfulHomePageQuery } from 'contentful-graphql'

type Props = {
  date: Date
}

const AssetsHomeSection: FC<Props> = ({ date }) => {
  const [featuredTokens, setFeaturedTokens] = useState<string[]>([])

  useEffect(() => {
    const contentfulClient = getContentfulClient();
    void contentfulClient?.query<ContentfulHomePageQuery>({
      query: ContentfulHomePageDocument,
    }).then(r => setFeaturedTokens(r.data.homePage?.notableTokens as string[] ?? []))
  }, [])


  const { address } = useAccount()
  const { t } = useTranslation('templates')
  const defaultAssetQuery = useFetchDefaultAssetIdsQuery({
    variables: { limit: environment.PAGINATION_LIMIT },
    skip: featuredTokens.length > 0,
  })
  useHandleQueryError(defaultAssetQuery)

  const assetIds = useMemo(() => {
    return featuredTokens
  }, [featuredTokens, date])

  const assetsQuery = useFetchAssetsQuery({
    variables: {
      now: date,
      limit: environment.PAGINATION_LIMIT,
      assetIds: assetIds || [],
      address: address || '',
    },
    skip: assetIds === undefined,
  })
  useHandleQueryError(assetsQuery)
  const assetData = assetsQuery.data

  const assets = useOrderByKey(
    assetIds,
    assetData?.assets?.nodes,
    (asset) => asset.id,
  )

  if (!assets)
    return (
      <Stack spacing={6}>
        <Skeleton noOfLines={1} height={8} width={200} />
        <SkeletonGrid
          items={environment.PAGINATION_LIMIT}
          columns={{ sm: 2, md: 3, lg: 4 }}
        >
          <SkeletonTokenCard />
        </SkeletonGrid>
      </Stack>
    )

  if (assets.length === 0) return null
  return (
    <Stack spacing={6}>
      <Flex flexWrap="wrap" align="center" justify="space-between" gap={4}>
        <Heading as="h2" variant="subtitle" color="brand.black">
          {t('home.nfts.title')}
        </Heading>
        <Link href="/explore">
          <Button
            variant="outline"
            colorScheme="gray"
            rightIcon={<Icon as={HiArrowNarrowRight} h={5} w={5} />}
            iconSpacing="10px"
          >
            <Text as="span" isTruncated>
              {t('home.nfts.explore')}
            </Text>
          </Button>
        </Link>
      </Flex>
      <SimpleGrid flexWrap="wrap" spacing={4} columns={{ sm: 2, md: 3, lg: 4 }}>
        {assets.map((item, i) => (
          <Flex key={i} justify="center" overflow="hidden">
            <TokenCard
              asset={convertAsset(item)}
              creator={convertUser(item.creator, item.creator.address)}
              sale={convertSale(item.firstSale.nodes[0])}
              auction={
                item.auctions.nodes[0]
                  ? convertAuctionWithBestBid(item.auctions.nodes[0])
                  : undefined
              }
              numberOfSales={item.firstSale.totalCount}
              hasMultiCurrency={item.firstSale.totalCurrencyDistinctCount > 1}
            />
          </Flex>
        ))}
      </SimpleGrid>
    </Stack>
  )
}

export default AssetsHomeSection
