import { getItemSkuDisplayName } from 'features/inventory/features/display-inventory/lib/functions'
import { useStockList } from 'lib/api/stock'
import { useAppStore } from 'lib/store'
import { StockObject } from 'lib/types'
import Select from 'react-select'

export default function Vendor() {
  const { inventory } = useStockList()
  const { receiveStock, setReceiveStock, addReceiveStockItem } = useAppStore()
  const addItem = (item: any) => addReceiveStockItem(item?.value)
  return (
    <div>
      <div className="helper-text mb-2">
        {`Add items already in the vendor's inventory.`}
      </div>
      <div className="h-dialog overflow-y-scroll">
        <Select
          className="w-full self-stretch"
          value={null}
          options={inventory
            ?.filter(
              (item: StockObject) =>
                item?.vendorId === receiveStock?.vendor_id &&
                !receiveStock?.items
                  ?.map((item) => item?.item?.id)
                  .includes(item?.id)
            )
            ?.map((item: StockObject) => ({
              value: item,
              label: getItemSkuDisplayName(item),
            }))}
          onChange={addItem}
        />
      </div>
    </div>
  )
}
