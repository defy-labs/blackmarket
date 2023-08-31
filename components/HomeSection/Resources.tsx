import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useState } from 'react'
import HomeGridSection from './Grid'
import HomeSectionCard, { Props as ItemProps } from './SectionCard'
import { getContentfulClient } from 'client'
import { ContentTypeResourceLink, ContentfulHomePageDocument, ContentfulHomePageQuery } from 'contentful-graphql'

type Props = {}

// const items: ItemProps[] = []

/* Example usage below */
// const items: ItemProps[] = [
//   {
//     href: 'https://support.defydisrupt.io/advanced-gameplay-web3/black-market',
//     isExternal: true,
//     image: 'https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/162ffdf8-a863-43aa-b46b-c3b9f8195ef5/1128x191-Notion-Banner/w=3840,quality=80',
//     title: 'How to use the Black Market',
//     description: 'The Black Market is the trading platform where you and your fellow Operatives can buy and sell DEFY assets.',
//   },
//   {
//     href: 'https://support.defydisrupt.io/events-coming-soon',
//     isExternal: true,
//     image: 'https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/162ffdf8-a863-43aa-b46b-c3b9f8195ef5/1128x191-Notion-Banner/w=3840,quality=80',
//     title: 'Cyber Quest',
//     description: 'With a staggering total prize pool of USD$100,000, including life changing jackpot prizes of USD$10,000,',
//   },
//   {
//     href: 'https://guide.defydisrupt.io/battle-pass',
//     isExternal: true,
//     image: 'https://images.spr.so/cdn-cgi/imagedelivery/j42No7y-dcokJuNgXeA0ig/162ffdf8-a863-43aa-b46b-c3b9f8195ef5/1128x191-Notion-Banner/w=3840,quality=80',
//     title: 'Battlepass FAQ',
//     description: 'Obtain extra rewards by holding this Battle Pass. Valid 18th-31st August.',
//   },
// ]


const ResourcesHomeSection: FC<Props> = () => {
  const [resources, setResources] = useState<ContentTypeResourceLink[]>()
  const mappedResources: ItemProps[] = resources?.map(r => ({
    title: r.title ?? '',
    description: r.description ?? '',
    href: r.href ?? '',
    image: r.image?.url ?? '',
    isExternal: r.isExternal ?? true
  })) ?? []

  useEffect(() => {
    const contentfulClient = getContentfulClient();
    void contentfulClient?.query<ContentfulHomePageQuery>({
      query: ContentfulHomePageDocument,
    }).then(r => setResources(r.data.homePage?.resourcesCollection?.items as ContentTypeResourceLink[]))
  }, [])


  const { t } = useTranslation('templates')

  return (
    <HomeGridSection
      items={mappedResources}
      itemRender={(item: ItemProps) => (
        <HomeSectionCard
          href={item.href}
          isExternal={item.isExternal}
          image={item.image}
          title={item.title}
          description={item.description}
        />
      )}
      title={t('home.resources')}
    />
  )
}

export default ResourcesHomeSection
