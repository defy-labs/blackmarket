import { Stack } from '@chakra-ui/react'
import AssetsHomeSection from 'components/HomeSection/Assets'
import CollectionsHomeSection from 'components/HomeSection/Collections'
import FeaturedHomeSection from 'components/HomeSection/Featured'
import ResourcesHomeSection from 'components/HomeSection/Resources'
import { NextPage } from 'next'
import { useMemo } from 'react'
import LargeLayout from '../layouts/large'

type Props = {
  now: number
}
const HomePage: NextPage<Props> = ({ now }) => {
  const date = useMemo(() => new Date(now), [now])
  return (
    <LargeLayout>
      <Stack spacing={12}>
        <FeaturedHomeSection date={date} />
        <CollectionsHomeSection />
        <AssetsHomeSection date={date} />
        <ResourcesHomeSection />
      </Stack>
    </LargeLayout>
  )
}

export default HomePage
