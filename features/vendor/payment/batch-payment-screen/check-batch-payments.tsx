import CheckIcon from '@mui/icons-material/CheckCircleOutline'
import NoBankDetailsIcon from '@mui/icons-material/CreditCardOff'
import StoreCreditOnlyIcon from '@mui/icons-material/ShoppingBag'
import QuantityCheckIcon from '@mui/icons-material/Warning'
import { Tooltip } from '@mui/material'
import { useCurrentRegisterId } from 'lib/api/register'
import { useState } from 'react'
import { downloadEmailList, downloadKbbFile, modulusCheck } from 'lib/functions/payment'
import { useClerk } from 'lib/api/clerk'
import { ArrowLeft, Download } from '@mui/icons-material'
import { createVendorBatchPayment } from 'lib/api/vendor'
import { priceDollarsString } from 'lib/utils'

export default function CheckBatchPayments({ paymentList, setKbbLoaded, setEmailed, setStage }) {
  const { registerId } = useCurrentRegisterId()
  const { clerk } = useClerk()
  const totalPay = paymentList?.reduce((prev, v) => (v?.isChecked ? parseFloat(v?.payAmount) : 0) + prev, 0)
  const vendorNum = paymentList?.reduce((prev, v) => (v?.isChecked ? 1 : 0) + prev, 0)
  const [includeUnchecked, setIncludeUnchecked] = useState(false)
  const [includeNoBank, setIncludeNoBank] = useState(false)
  console.log(paymentList)
  // : [
  //   {
  //     type: 'cancel',
  //     onClick: () => setStage('select'),
  //     text: 'BACK',
  //   },
  //   {
  //     type: 'ok',
  //     text: 'DOWNLOAD AND COMPLETE',
  //     onClick: () => {
  //       createVendorBatchPayment({ paymentList, clerkId: clerk?.id, registerId, emailed }).then((id) => {
  //         downloadKbbFile(id, paymentList)
  //         downloadEmailList(id, paymentList)
  //       })
  //     },
  //   },
  // ]

  return (
    <div>
      <div className="flex justify-between p-2">
        <div className="text-red-400 text-2xl font-bold text-right">
          {paymentList?.filter((v) => isNaN(parseFloat(v?.payAmount)))?.length > 0
            ? `CHECK PAY ENTRIES`
            : `PAY ${priceDollarsString(totalPay)}\nto ${vendorNum} VENDORS`}
        </div>

        <div className="px-4">
          <div className="icon-text-button" onClick={() => setStage('select')}>
            GO BACK <ArrowLeft />
          </div>
          <div
            className="icon-text-button"
            onClick={() => {
              createVendorBatchPayment({ paymentList, clerkId: clerk?.id, registerId, emailed: true }).then((id) => {
                downloadKbbFile(id, paymentList)
                downloadEmailList(id, paymentList)
              })
            }}
          >
            COMPLETE AND DOWNLOAD <Download />
          </div>
        </div>
      </div>
      <div className="text-sm p-2">
        <div className="font-bold">NOTE</div>
        Vendors with $0 payments or vendors with invalid bank account numbers will not be added to the KBB file, only
        the email CSV.
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={includeUnchecked}
              onChange={(e) => setIncludeUnchecked(e.target.checked)}
            />
            <div className="ml-2">Include unchecked vendors</div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={includeNoBank}
              onChange={(e) => setIncludeNoBank(e.target.checked)}
            />
            <div className="ml-2">Include vendors with no bank account number</div>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="flex font-bold py-2 px-2 border-b border-black">
          <div className="w-1/2">NAME</div>
          <div className="w-1/4">AMOUNT</div>
          <div className="w-1/4" />
        </div>
        <div className="h-dialog overflow-y-scroll">
          {paymentList
            ?.filter((v) => v?.isChecked)
            ?.map((v) => {
              let invalidBankAccountNumber = !modulusCheck(v?.bankAccountNumber)
              let negativeQuantity = v?.totalItems?.filter((i) => i?.quantity < 0)?.length > 0
              return (
                <div
                  key={v?.id}
                  className={`py-2 px-2 text-sm border-b flex${parseFloat(v?.payAmount) <= 0 ? ' opacity-50' : ''}`}
                >
                  <div className="w-1/2">{`[${v?.id}] ${v?.name}`}</div>
                  <div className="w-1/4">{priceDollarsString(v?.payAmount)}</div>
                  <div className="flex w-1/4">
                    {v?.storeCreditOnly ? (
                      <div className="text-blue-500 pl-2">
                        <Tooltip title="Vendor wants Store Credit Only">
                          <StoreCreditOnlyIcon />
                        </Tooltip>
                      </div>
                    ) : (
                      <div />
                    )}
                    {invalidBankAccountNumber ? (
                      <Tooltip title={`${v?.bankAccountNumber ? 'Invalid' : 'Missing'} Bank Account Number`}>
                        <div className={`${v?.bankAccountNumber ? 'text-orange-500' : 'text-red-500'} pl-2 flex`}>
                          <NoBankDetailsIcon />
                        </div>
                      </Tooltip>
                    ) : (
                      <div />
                    )}
                    {negativeQuantity ? (
                      <Tooltip title="Vendor has negative quantity items. Please check!">
                        <div className="text-purple-500 pl-2">
                          <QuantityCheckIcon />
                        </div>
                      </Tooltip>
                    ) : (
                      <div />
                    )}
                    {!negativeQuantity && !invalidBankAccountNumber && !v?.storeCreditOnly ? (
                      <Tooltip title="Everything looks good!">
                        <div className="text-green-500 pl-2">
                          <CheckIcon />
                        </div>
                      </Tooltip>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

{
  /* <div className="flex mb-2">
<button
  className="border p-2 rounded bg-gray-100 hover:bg-gray-200"
  onClick={() => {
    let csvContent = writeKiwiBankBatchFile({
      transactions: paymentList
        ?.filter((v) => v?.isChecked)
        ?.map((vendor: any) => ({
          name: vendor?.name || '',
          vendorId: `${vendor?.id || ''}`,
          accountNumber: vendor?.bankAccountNumber || '',
          amount: dollarsToCents(vendor?.payAmount),
        })),
      batchNumber: `${registerId}`,
      sequenceNumber: 'Batch',
    })
    var link = document.createElement('a')
    link.setAttribute('href', csvContent)
    link.setAttribute('download', `batch-payment-${dayjs().format('YYYY-MM-DD')}.kbb`)
    document.body.appendChild(link)
    link.click()
    setKbbLoaded(true)
  }}
>
  Download KiwiBank Batch KBB
</button>
<button
  className="ml-2 border p-2 rounded bg-gray-100 hover:bg-gray-200"
  onClick={() => {
    let csvContent = writePaymentNotificationEmail({
      paymentList,
      includeUnchecked,
      includeNoBank,
    })
    var link = document.createElement('a')
    link.setAttribute('href', csvContent)
    link.setAttribute('download', `batch-payment-email-list-${dayjs().format('YYYY-MM-DD')}.csv`)
    document.body.appendChild(link)
    link.click()
    setEmailed(true)
  }}
>
  Download Email List CSV
</button>
</div> */
}
