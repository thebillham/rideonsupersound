import {
  getItemById,
  getItemSkuDisplayName,
} from 'lib/functions/displayInventory'
import { ClerkObject, StockMovementObject, StockObject } from 'lib/types'

type ListItemProps = {
  sm: StockMovementObject
  clerks: ClerkObject[]
  stockDisplay: StockObject[]
}

export default function ListStockMovement({
  sm,
  clerks,
  stockDisplay,
}: ListItemProps) {
  return (
    <div className="flex w-full border-b border-yellow-100 py-1 font-mono text-xs text-black">
      <div className="flex flex-col sm:flex-row w-full justify-between">
        <div className="flex flex-col sm:flex-row w-full">
          <div className="font-bold pr-4 text-pink-600 w-1/6">
            {sm?.dateMoved}
          </div>
          <div className="font-bold w-16 text-blue-800 w-1/12">
            {clerks?.find((c: ClerkObject) => c?.id === sm?.clerkId)?.name}
          </div>
          <div className="uppercase pr-4 w-1/12">{sm?.act}</div>
          <div className="font-bold pr-4 w-1/12">{sm?.quantity} x</div>
          <div className="w-7/12">
            {getItemSkuDisplayName(getItemById(sm?.stockId, stockDisplay))}
          </div>
        </div>
      </div>
    </div>
  )
}