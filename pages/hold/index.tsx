import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import Layout from 'components/layout'
import CreateCustomerSidebar from 'features/customer/sidebar'
import HoldTable from 'features/sale/display-holds/hold-table'
import HoldDialog from 'features/sale/features/hold/components/hold-dialog'

export default function HoldsPage() {
  return (
    <div className={`flex relative overflow-x-hidden`}>
      <HoldTable />
      {/* {loadedHoldId?.holds && <HoldDialog />}
      {loadedSaleId?.holds && <SaleItemScreen />} */}
      <CreateCustomerSidebar />
    </div>
  )
}

HoldsPage.getLayout = (page) => <Layout>{page}</Layout>

export const getServerSideProps = withPageAuthRequired()
