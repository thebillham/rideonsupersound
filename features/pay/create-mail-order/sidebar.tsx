import { useState } from 'react'
import SidebarContainer from 'components/container/side-bar'
import CreateableSelect from 'components/inputs/createable-select'
import { CustomerObject, ModalButton } from 'lib/types'
import { useAppStore } from 'lib/store'
import { ViewProps } from 'lib/store/types'
import { useCustomers } from 'lib/api/customer'
import { saveCart } from 'lib/api/sale'
import { SaleStateTypes } from 'lib/types/sale'
import TextField from 'components/inputs/text-field'

export default function CreateMailOrder() {
  const { cart, view, setCartSale, setCart, openView, closeView } = useAppStore()
  const { sale = {} } = cart || {}
  const { customers } = useCustomers()
  const [postage, setPostage] = useState(0)
  const [postalAddress, setPostalAddress] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onClickCreateMailOrder()
  }

  async function onClickCreateMailOrder() {
    let saleUpdate = { ...sale }
    if (sale?.state !== SaleStateTypes.Layby) {
      saleUpdate = {
        ...sale,
        isMailOrder: true,
        postage,
        postalAddress,
      }
    }
    saveCart({ ...cart, sale: saleUpdate }, sale?.state)
    closeView(ViewProps.createMailOrder)
  }

  const buttons: ModalButton[] = [
    {
      type: 'cancel',
      onClick: () => {
        closeView(ViewProps.createMailOrder)
      },
      text: 'CANCEL',
    },
    {
      type: 'ok',
      onClick: onClickCreateMailOrder,
      disabled: !sale?.customerId,
      text: 'ADD MAIL ORDER',
    },
  ]

  return (
    <SidebarContainer
      show={view?.createMailOrder}
      title={`${sale?.isMailOrder ? 'EDIT' : 'CREATE'} MAIL ORDER`}
      buttons={buttons}
      handleSubmit={handleSubmit}
    >
      <div>
        <CreateableSelect
          inputLabel="Select customer"
          autoFocus
          fieldRequired
          value={sale?.customerId}
          label={customers?.find((c: CustomerObject) => c?.id === sale?.customerId)?.name || ''}
          onChange={(customerObject: any) => {
            setCartSale({ customerId: parseInt(customerObject?.value) })
          }}
          onCreateOption={(inputValue: string) => {
            setCart({ customer: { name: inputValue } })
            openView(ViewProps.createCustomer)
          }}
          options={customers?.map((val: CustomerObject) => ({
            value: val?.id,
            label: val?.name || '',
          }))}
        />
        <TextField
          inputLabel="Postage Fee"
          startAdornment="$"
          inputType="number"
          valueNum={postage}
          onChange={(e: any) => setPostage(e.target.value)}
        />
        <TextField
          inputLabel="Postal Address"
          multiline
          value={postalAddress}
          onChange={(e: any) => setPostalAddress(e.target.value)}
        />
      </div>
    </SidebarContainer>
  )
}
