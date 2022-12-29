import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import Layout from 'components/layout'
import StocktakeTemplateScreen from 'features/inventory/stocktake/stocktake-template-screen'
// import { useRouter } from 'next/router'

export default function StocktakePage() {
  // const router = useRouter()
  // const id = router.query.id
  return <StocktakeTemplateScreen />
}

StocktakePage.getLayout = (page) => <Layout>{page}</Layout>

export const getServerSideProps = withPageAuthRequired()
