import { getItemDisplayName, getItemSkuDisplayName } from 'lib/functions/displayInventory'
import { useAppStore } from 'lib/store'

export default function Items({ onClick }) {
  const { batchReceiveSession } = useAppStore()
  return (
    <div>
      {batchReceiveSession?.items?.length > 0 ? (
        batchReceiveSession?.items?.map((item: any) => (
          <div
            key={item?.key}
            className="flex hover:bg-gray-200 items-center p-2 cursor-pointer border-b"
            onClick={() => onClick(item)}
          >
            {item?.item?.id ? getItemSkuDisplayName(item?.item) : getItemDisplayName(item?.item)}
          </div>
        ))
      ) : (
        <div>No items currently selected.</div>
      )}
    </div>
  )
}
