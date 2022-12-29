import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import Layout from 'components/layout'
import PaymentTable from 'features/payment/display-payments/payment-table'
import BatchPaymentScreen from 'features/payment/batch-payment-screen'
import CashPaymentDialog from 'features/payment/cash-payment-dialog'
import TransferVendorPaymentDialog from 'features/payment/transfer-payment-dialog'
import { useAppStore } from 'lib/store'

export default function PaymentsPage() {
  const { view } = useAppStore()
  return (
    <div className={`flex relative overflow-x-hidden`}>
      <PaymentTable />
      {view?.cashVendorPaymentDialog && <CashPaymentDialog />}
      {view?.batchVendorPaymentScreen && <BatchPaymentScreen />}
      {view?.transferVendorPaymentDialog && <TransferVendorPaymentDialog />}
    </div>
  )
}

PaymentsPage.getLayout = (page) => <Layout>{page}</Layout>

export const getServerSideProps = withPageAuthRequired()
