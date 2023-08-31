import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useState } from 'react'
import HomeGridSection from './Grid'
import HomeSectionCard, { Props as ItemProps } from './SectionCard'
import { getContentfulClient } from 'client'
import { ContentfulHomePageDocument, ContentfulHomePageQuery, TokenCollection } from 'contentful-graphql'

type Props = {}

const FeaturedCollections: FC<Props> = () => {
	const [featuredCollections, setFeaturedCollections] = useState<TokenCollection[]>()

	const { t } = useTranslation('templates')

	useEffect(() => {
		const contentfulClient = getContentfulClient();
		contentfulClient?.query<ContentfulHomePageQuery>({
			query: ContentfulHomePageDocument,
		}).then(r => setFeaturedCollections(r.data.homePage?.featuredCollectionsCollection?.items as TokenCollection[] ?? []))
	}, [])

	const items = featuredCollections?.map(c => ({
		href: `/collection/${c.collectionAddress?.replace('-', '/')}`,
		isExternal: false,
		image: c.featureImage?.url,
		title: c.name
	}))

	return (
		<HomeGridSection
			items={items}
			itemRender={(item: ItemProps) => (
				<HomeSectionCard
					href={item.href}
					isExternal={item.isExternal}
					image={item.image}
					title={item.title}
					description={item.description}
				/>
			)}
			title={t('home.featuredCollections')}
		/>
	)
}

export default FeaturedCollections
