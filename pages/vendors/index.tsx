import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import Layout from 'components/layout'
import CashPaymentDialog from 'features/vendor/payment/cash-payment-dialog'
import TransferVendorPaymentDialog from 'features/vendor/payment/transfer-payment-dialog'
import VendorsScreen from 'features/vendor'
import { useAppStore } from 'lib/store'
import VendorEditDialog from 'features/vendor/vendor-edit-dialog'

export default function VendorsPage() {
  const { view } = useAppStore()
  return (
    <>
      <div className={`flex relative overflow-x-hidden`}>
        <VendorsScreen />
      </div>
      {view?.cashVendorPaymentDialog && <CashPaymentDialog />}
      {view?.transferVendorPaymentDialog && <TransferVendorPaymentDialog />}
      {view?.vendorEditDialog && <VendorEditDialog vendor={{}} />}
    </>
  )
}

VendorsPage.getLayout = (page) => <Layout>{page}</Layout>

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
