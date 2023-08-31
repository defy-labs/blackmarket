import CollectionCard from 'components/Collection/CollectionCard'
import { convertCollection } from 'convert'
import environment from 'environment'
import { useOrderByKey } from 'hooks/useOrderByKey'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useState } from 'react'
import invariant from 'ts-invariant'
import {
  CollectionFilter,
  FetchCollectionsQuery,
  useFetchCollectionsQuery,
} from '../../graphql'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import HomeGridSection from './Grid'
import { getContentfulClient } from 'client'
import { ContentfulHomePageDocument, ContentfulHomePageQuery } from 'contentful-graphql'

type Props = {}

const CollectionsHomeSection: FC<Props> = () => {
  const [featuredCollections, setFeaturedCollections] = useState<string[]>()
  environment.HOME_COLLECTIONS = featuredCollections ?? []

  const { t } = useTranslation('templates')

  useEffect(() => {
    const contentfulClient = getContentfulClient();
    contentfulClient?.query<ContentfulHomePageQuery>({
      query: ContentfulHomePageDocument,
    }).then(r => setFeaturedCollections(r.data.homePage?.notableCollections as string[] ?? []))
  }, [])

  const collectionsQuery = useFetchCollectionsQuery({
    variables: {
      filter: {
        or: environment.HOME_COLLECTIONS.map((x) => x.split('-')).map(
          ([chainId, collectionAddress]) => {
            invariant(chainId && collectionAddress, 'invalid collection')
            return {
              address: { equalTo: collectionAddress.toLowerCase() },
              chainId: { equalTo: parseInt(chainId, 10) },
            }
          },
        ),
      } as CollectionFilter,
      limit: environment.PAGINATION_LIMIT,
    },
    skip: !environment.HOME_COLLECTIONS.length,
  })
  useHandleQueryError(collectionsQuery)

  const orderedCollections = useOrderByKey(
    environment.HOME_COLLECTIONS,
    collectionsQuery.data?.collections?.nodes,
    (collection) => [collection.chainId, collection.address].join('-'),
  )

  if (!environment.HOME_COLLECTIONS.length) return null
  return (
    <HomeGridSection
      explore={{
        href: '/explore/collections',
        title: t('home.collections.explore'),
      }}
      items={orderedCollections}
      itemRender={(
        collection: NonNullable<
          FetchCollectionsQuery['collections']
        >['nodes'][number],
      ) => <CollectionCard collection={convertCollection(collection)} />}
      title={t('home.collections.title')}
    />
  )
}

export default CollectionsHomeSection
