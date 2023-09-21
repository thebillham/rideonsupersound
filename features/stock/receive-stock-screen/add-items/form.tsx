import { ChevronRight } from '@mui/icons-material'
import { useState } from 'react'
import { useAppStore } from 'lib/store'
import { StockItemObject } from 'lib/types/stock'
import StockEditForm from 'features/stock/stock-edit-dialog/form'
import { getDefaultReceiveItem } from 'lib/functions/receiveStock'

export default function Form() {
  const { batchReceiveSession, addBatchReceiveItem } = useAppStore()
  const defaultItem = getDefaultReceiveItem(batchReceiveSession)

  const [item, setItem] = useState<StockItemObject>(defaultItem?.item)
  return (
    <div>
      <div className="flex justify-end align-center">
        <button
          onClick={() => {
            addBatchReceiveItem({ ...defaultItem, item })
            setItem(defaultItem?.item)
          }}
          disabled={!item?.title}
          className="bg-col3-dark hover:bg-col3 ring-1 disabled:bg-gray-200 p-2 rounded"
        >
          Add Item To Basket <ChevronRight />
        </button>
      </div>
      <StockEditForm item={item} setItem={setItem} />
    </div>
  )
}
