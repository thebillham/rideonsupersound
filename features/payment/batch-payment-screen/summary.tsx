import SearchInput from 'components/inputs/search-input'
import { useAppStore } from 'lib/store'
import { priceCentsString } from 'lib/utils'

const BatchPaymentSummary = ({ search, setSearch, paymentList }) => {
  const { batchPaymentSession } = useAppStore()
  const { totalNumVendors = 0, totalPay = 0 } = batchPaymentSession || {}
  return (
    <div className="flex items-start">
      <img width="80" src={`${process.env.NEXT_PUBLIC_RESOURCE_URL}img/KiwiBank.png`} alt={'KiwiBank'} />
      <div className="mx-2 w-full">
        <div className="text-red-400 text-2xl font-bold text-right">
          {paymentList?.filter((v) => isNaN(parseFloat(v?.payAmount)))?.length > 0
            ? `CHECK PAY ENTRIES`
            : `PAY ${priceCentsString(totalPay)}\nto ${totalNumVendors} VENDOR${totalNumVendors === 1 ? '' : 'S'}`}
        </div>
        <SearchInput searchValue={search} handleSearch={(e) => setSearch(e?.target?.value)} />
      </div>
    </div>
  )
}

export default BatchPaymentSummary
