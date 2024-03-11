import { AttachMoney, Delete, Edit, LibraryAdd } from '@mui/icons-material'
import MidScreenContainer from 'components/container/mid-screen'
import Tabs from 'components/navigation/tabs'
import { deleteStockItem, useStockItem, updateStockItem } from 'lib/api/stock'
import { getItemSkuDisplayName } from 'lib/functions/displayInventory'
import { useAppStore } from 'lib/store'
import { ViewProps } from 'lib/store/types'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useSWRConfig } from 'swr'
import DiscogsPanel from '../api-discogs'
import PriceDetails from './price-details'
import StockDetails from './stock-details'
import StockItemDisplay from './stock-display'
import GoogleBooksPanel from '../api-google-books'

const StockItemScreen = ({ item, sales }) => {
  const { openConfirm, openView } = useAppStore()
  const [tab, setTab] = useState(0)
  const router = useRouter()
  const { mutate } = useSWRConfig()

  const { stockItem } = useStockItem(`${item?.id}`)

  function onClickDelete() {
    const hasBeenSold = sales?.length > 0
    openConfirm({
      open: true,
      title: hasBeenSold ? 'Sorry' : 'Are you sure you want to delete this item?',
      message: hasBeenSold
        ? `This item has already been sold, so can't be deleted. Use CHANGE
                STOCK LEVEL if it's out of stock.`
        : 'This will delete the item from the stock list.',
      yesText: hasBeenSold ? 'OK' : "YES, I'M SURE",
      yesButtonOnly: hasBeenSold,
      action: hasBeenSold
        ? () => {}
        : async () =>
            deleteStockItem(item?.id)?.then(() => {
              router.push('/stock')
              mutate('stock')
            }),
    })
  }

  const onImageUpload = (imageUrl) => {
    console.log(imageUrl)
    updateStockItem({ imageUrl }, item?.id).then(() => mutate(`stock/${item?.d}`))
  }

  const menuItems = [
    { text: 'Edit', icon: <Edit />, onClick: () => openView(ViewProps.stockEditDialog) },
    { text: 'Change Price', icon: <AttachMoney />, onClick: () => openView(ViewProps.changePriceDialog) },
    { text: 'Change Quantities', icon: <LibraryAdd />, onClick: () => openView(ViewProps.changeStockQuantityDialog) },
    { text: 'Delete Item', icon: <Delete />, onClick: onClickDelete },
  ]

  return (
    <MidScreenContainer
      title={`STOCK ${getItemSkuDisplayName(item)}`}
      titleClass="bg-brown-dark text-white"
      menuItems={menuItems}
      showBackButton
      full
      dark
    >
      <>
        <Tabs
          tabs={
            item?.media === 'Mixed'
              ? ['General Information', 'Discogs', 'GoogleBooks']
              : item?.media === 'Audio'
              ? ['General Information', 'Discogs']
              : item?.media === 'Literature'
              ? ['General Information', 'GoogleBooks']
              : null
          }
          value={tab}
          onChange={setTab}
        />
        <div className="px-2">
          <div hidden={tab !== 0}>
            <div className="flex">
              <div className="w-1/3">
                <StockItemDisplay stockItem={stockItem} onImageUpload={onImageUpload} />
              </div>
              <div className="w-2/3 ml-4">
                <PriceDetails stockItem={stockItem} />
                <StockDetails stockItem={stockItem} />
              </div>
            </div>
          </div>
          <div hidden={!(tab === 1 && (item?.media === 'Audio' || item?.media === 'Video' || item?.media === 'Mixed'))}>
            <DiscogsPanel stockItem={stockItem} />
          </div>
          <div hidden={!(tab === 1 && item?.media === 'Literature') && !(tab === 2 && item?.media === 'Mixed')}>
            <GoogleBooksPanel stockItem={stockItem} />
          </div>
        </div>
      </>
    </MidScreenContainer>
  )
}

export default StockItemScreen
