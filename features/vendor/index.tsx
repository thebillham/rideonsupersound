import { AccountBalance, AddCircle, DisplaySettings, Money, TransferWithinAStation } from '@mui/icons-material'
import MidScreenContainer from 'components/container/mid-screen'
import Tabs from 'components/navigation/tabs'
import ComingSoon from 'components/placeholders/coming-soon'
import { useAppStore } from 'lib/store'
import { Pages, ViewProps } from 'lib/store/types'
import React from 'react'
import VendorList from './vendor-list'
import { useRouter } from 'next/router'

const VendorsScreen = () => {
  const {
    vendorsPage: { tab },
    setPage,
    openView,
  } = useAppStore()
  const router = useRouter()
  const setTab = (tab) => setPage(Pages.vendorsPage, { tab })
  const menuItems = [
    { text: 'New Vendor', icon: <AddCircle />, onClick: () => openView(ViewProps.vendorEditDialog) },
    { text: 'Manually Pay Vendor', icon: <Money />, onClick: () => openView(ViewProps.cashVendorPaymentDialog) },
    {
      text: 'Transfer Credit Between Vendors',
      icon: <TransferWithinAStation />,
      onClick: () => openView(ViewProps.transferVendorPaymentDialog),
    },
    {
      text: 'Start New Batch Payment',
      icon: <AccountBalance />,
      onClick: () => router.push(`/batch-payment/new`),
      // onClick: () => openView(ViewProps.batchVendorPaymentDialog),
    },
    { text: 'Manage Settings', icon: <DisplaySettings />, onClick: null, disabled: true },
  ]
  return (
    <MidScreenContainer title="Vendors" isLoading={false} titleClass="bg-col3" full={true} menuItems={menuItems}>
      <Tabs tabs={['Vendor List', 'My Vendors', 'Payments', 'Balance Sheet']} value={tab} onChange={setTab} />
      {tab === 0 && <VendorList />}
      {tab === 1 && <ComingSoon />}
      {tab === 1 && <ComingSoon />}
      {tab === 1 && <ComingSoon />}
    </MidScreenContainer>
  )
}

export default VendorsScreen
