// Packages
import dayjs from 'dayjs'
import UTC from 'dayjs/plugin/utc'
import { useAtom } from 'jotai'
import { useMemo, useState } from 'react'

// DB
import { alertAtom, cartAtom, clerkAtom, viewAtom } from '@lib/atoms'
import {
  useInventory,
  useRegisterID,
  useSalesJoined,
  useVendorPayments,
  useVendors,
} from '@lib/database/read'
import {
  ModalButton,
  PaymentMethodTypes,
  SaleTransactionObject,
  VendorObject,
} from '@lib/types'

// Components
import TextField from '@components/inputs/text-field'
import Modal from '@components/modal'
import { logSalePaymentAcct } from '@features/log/lib/functions'
import { getVendorDetails } from '@features/vendor/features/item-vendor/lib/functions'
import Select from 'react-select'
import { getSaleVars } from '../../lib/functions'

export default function Acct() {
  dayjs.extend(UTC)
  // Atoms
  const [clerk] = useAtom(clerkAtom)
  const [view, setView] = useAtom(viewAtom)
  const [cart, setCart] = useAtom(cartAtom)
  const [, setAlert] = useAtom(alertAtom)

  // State
  const [vendorWrapper, setVendorWrapper] = useState(null)

  // SWR
  const { registerID } = useRegisterID()
  const { inventory } = useInventory()
  const { vendors } = useVendors()
  const { sales } = useSalesJoined()
  const { vendorPayments } = useVendorPayments()

  const { totalRemaining } = getSaleVars(cart, inventory)

  // State
  const isRefund = totalRemaining < 0
  const [acctPayment, setAcctPayment] = useState(
    `${Math.abs(totalRemaining)?.toFixed(2)}`
  )
  const [submitting, setSubmitting] = useState(false)

  // Constants
  const vendorVars = useMemo(
    () =>
      getVendorDetails(
        inventory,
        sales,
        vendorPayments,
        vendorWrapper?.value?.id,
        cart
      ),
    [inventory, sales, vendorPayments, vendorWrapper?.value?.id]
  )

  const buttons: ModalButton[] = [
    {
      type: 'ok',
      disabled:
        submitting ||
        parseFloat(acctPayment) > Math.abs(totalRemaining) ||
        parseFloat(acctPayment) <= 0 ||
        acctPayment <= '' ||
        // (!isRefund && vendorVars?.totalOwing / 100 < parseFloat(acctPayment)) ||
        isNaN(parseFloat(acctPayment)),
      loading: submitting,
      onClick: () => {
        setSubmitting(true)
        let transaction: SaleTransactionObject = {
          date: dayjs.utc().format(),
          sale_id: cart?.id,
          clerk_id: clerk?.id,
          payment_method: PaymentMethodTypes.Account,
          amount: isRefund
            ? parseFloat(acctPayment) * -100
            : parseFloat(acctPayment) * 100,
          register_id: registerID,
          vendor: vendorWrapper?.value,
          is_refund: isRefund,
        }
        let transactions = cart?.transactions || []
        transactions.push(transaction)
        setCart({ ...cart, transactions })
        setSubmitting(false)
        setView({ ...view, acctPaymentDialog: false })
        logSalePaymentAcct(acctPayment, vendorWrapper, isRefund, cart, clerk)
        setAlert({
          open: true,
          type: 'success',
          message: `$${parseFloat(acctPayment)?.toFixed(2)} ACCOUNT ${
            isRefund ? `REFUND` : `PAYMENT`
          }`,
        })
      },
      text: 'COMPLETE',
    },
  ]

  return (
    <Modal
      open={view?.acctPaymentDialog}
      closeFunction={() => setView({ ...view, acctPaymentDialog: false })}
      title={isRefund ? `ACCOUNT REFUND` : `ACCOUNT PAYMENT`}
      buttons={buttons}
    >
      <>
        <TextField
          divClass="text-8xl"
          startAdornment="$"
          inputClass="text-center"
          value={acctPayment}
          autoFocus={true}
          selectOnFocus
          onChange={(e: any) => setAcctPayment(e.target.value)}
        />
        <div className="input-label">Select Vendor</div>
        <div className="pb-32">
          <Select
            className="w-full self-stretch"
            value={vendorWrapper}
            options={vendors
              ?.sort((vendorA: VendorObject, vendorB: VendorObject) => {
                const a = vendorA?.name
                const b = vendorB?.name
                return a > b ? 1 : b > a ? -1 : 0
              })
              ?.map((vendor: VendorObject) => ({
                value: vendor,
                label: vendor?.name,
              }))}
            onChange={(v: any) => setVendorWrapper(v)}
          />
        </div>
        <div className="text-center">{`Remaining to ${
          isRefund ? 'refund' : 'pay'
        }: $${Math.abs(totalRemaining)?.toFixed(2)}`}</div>
        {vendorWrapper ? (
          <>
            <div className="text-center font-bold">
              {`${isRefund ? `Currently` : `Remaining`} in account: ${
                false
                  ? `Loading...`
                  : `$${(vendorVars?.totalOwing / 100)?.toFixed(2)}`
              }`}
            </div>
            <div className="text-center text-xl font-bold my-4">
              {acctPayment === '' || parseFloat(acctPayment) === 0
                ? '...'
                : parseFloat(acctPayment) < 0
                ? 'NO NEGATIVES ALLOWED'
                : isNaN(parseFloat(acctPayment))
                ? 'NUMBERS ONLY PLEASE'
                : parseFloat(acctPayment) > Math.abs(totalRemaining)
                ? `${isRefund ? 'REFUND AMOUNT' : 'PAYMENT'} TOO HIGH`
                : isRefund
                ? 'ALL GOOD!'
                : vendorVars?.totalOwing / 100 < parseFloat(acctPayment)
                ? `NOT ENOUGH IN ACCOUNT, VENDOR WILL OWE THE SHOP`
                : parseFloat(acctPayment) < totalRemaining
                ? `AMOUNT SHORT BY $${(
                    totalRemaining - parseFloat(acctPayment)
                  )?.toFixed(2)}`
                : 'ALL GOOD!'}
            </div>
          </>
        ) : (
          <div className="text-center text-xl font-bold my-4">
            SELECT VENDOR ACCOUNT TO USE
          </div>
        )}
      </>
    </Modal>
  )
}
