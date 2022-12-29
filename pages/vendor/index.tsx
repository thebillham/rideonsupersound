import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import Layout from 'components/layout'
import ChangePriceDialog from 'features/inventory/item-stock/change-price-dialog'
import ChangeStockQuantityDialog from 'features/inventory/item-stock/change-stock-quantity-dialog'
import VendorTable from 'features/vendor/display-vendors/vendor-table'
import VendorScreen from 'features/vendor/item-vendor'
import { useAppStore } from 'lib/store'

export default function VendorPage() {
  const { view } = useAppStore()
  return (
    <div className={`flex relative overflow-x-hidden`}>
      <VendorTable />
      <VendorScreen />
      {view?.changePriceDialog && <ChangePriceDialog />}
      {view?.changeStockQuantityDialog && <ChangeStockQuantityDialog />}
    </div>
  )
}

VendorPage.getLayout = (page) => <Layout>{page}</Layout>

export const getServerSideProps = withPageAuthRequired()

// const handlers = useSwipeable({
//   onSwipedRight: () =>
//     showSaleScreen
//       ? setShowSaleScreen(false)
//       : showCreateCustomer?.id
//       ? setShowCreateCustomer({ id: 0 })
//       : showHold
//       ? setShowHold(false)
//       : showCart
//       ? setShowCart(false)
//       : null,
//   onSwipedLeft: () => (!showCart ? setShowCart(true) : null),
//   preventDefaultTouchmoveEvent: true,
// });
