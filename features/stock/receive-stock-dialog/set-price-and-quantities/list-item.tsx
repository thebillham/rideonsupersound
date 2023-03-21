import RadioButton from 'components/inputs/radio-button'
import SettingsSelect from 'components/inputs/settings-select'
import TextField from 'components/inputs/text-field'
import { getPriceSuggestion } from 'lib/functions/discogs'
import { getImageSrc, getItemDisplayName, getItemSku } from 'lib/functions/displayInventory'
import { getProfitMargin, getStoreCut } from 'lib/functions/pay'
import { useAppStore } from 'lib/store'
import { StockItemObject, StockPriceObject } from 'lib/types/stock'

export default function ListItem({ receiveItem }) {
  const { updateReceiveBasketItem } = useAppStore()
  const { item = {}, price = {} }: { item: StockItemObject; price: StockPriceObject } = receiveItem || {}
  const priceSuggestion = getPriceSuggestion(item)
  const totalSell = parseFloat(receiveItem?.totalSell || (price?.totalSell || 0) / 100)
  const vendorCut = parseFloat(receiveItem?.vendorCut || (price?.vendorCut || 0) / 100)
  const profitMargin = getProfitMargin({
    totalSell,
    vendorCut,
  })
  const storeCut = getStoreCut({ totalSell, vendorCut })

  return (
    <div className="flex justify-between my-2 border-b">
      <div className="flex">
        <div className="w-20">
          <div className="w-20 h-20 relative">
            <img className="object-cover absolute" src={getImageSrc(item)} alt={item?.title || 'Stock image'} />
            {!item?.isGiftCard && !item?.isMiscItem && item?.id && (
              <div className="absolute w-20 h-8 bg-opacity-50 bg-black text-white text-sm flex justify-center items-center">
                {getItemSku(item)}
              </div>
            )}
          </div>
        </div>
        <div className="ml-2">
          <div>{getItemDisplayName(item)}</div>
          <div className="text-sm italic">{priceSuggestion ? `Discogs suggest ${priceSuggestion}` : ''}</div>
        </div>
      </div>
      <div>
        <div className="self-center flex items-center">
          <RadioButton
            key={`${receiveItem?.key}isNew${item?.isNew}`}
            inputLabel="CONDITION"
            group={`${receiveItem?.key}isNew`}
            value={`${Boolean(item?.isNew)}`}
            onChange={(value: string) =>
              updateReceiveBasketItem(receiveItem?.key, value === 'true' ? { isNew: 1, cond: null } : { isNew: 0 })
            }
            options={[
              { id: `new${receiveItem?.key}`, value: 'true', label: 'New' },
              { id: `used${receiveItem?.key}`, value: 'false', label: 'Used' },
            ]}
          />
          <SettingsSelect
            className="w-full"
            object={item}
            customEdit={(e) => updateReceiveBasketItem(receiveItem?.key, { cond: e.value })}
            dbField="cond"
            sorted={false}
            isCreateDisabled={true}
          />
        </div>
        <div className="self-center flex items-center">
          <SettingsSelect
            className="w-1/2"
            object={item}
            customEdit={(e) => updateReceiveBasketItem(receiveItem?.key, { section: e.value })}
            inputLabel="SECTION"
            dbField="section"
            isCreateDisabled={true}
          />
          <SettingsSelect
            className="w-1/2 ml-2"
            object={item}
            customEdit={(e) => updateReceiveBasketItem(receiveItem?.key, { country: e.value })}
            inputLabel="COUNTRY"
            dbField="country"
          />
        </div>
        <div className="self-center flex items-center">
          {/* <TextField
            inputLabel="VENDOR CUT"
            className="w-24 mr-6"
            startAdornment={'$'}
            disabled={Boolean(item?.id)}
            value={`${receiveItem?.price?.vendorCut || (item?.vendorCut ? item?.vendorCut / 100 : '')}`}
            onChange={(e: any) =>
              updateReceiveBasketItem(receiveItem?.key, {
                vendorCut: e.target.value,
              })
            }
          />
          <TextField
            inputLabel="TOTAL SELL"
            className="w-24 mr-6"
            startAdornment={'$'}
            value={`${receiveItem?.totalSell || (item?.totalSell ? item?.totalSell / 100 : '')}`}
            onChange={(e: any) =>
              updateReceiveBasketItem(receiveItem?.key, {
                totalSell: e.target.value,
              })
            }
          /> */}
          <TextField
            displayOnly={true}
            inputLabel="STORE CUT"
            error={storeCut < 0}
            className={`w-24 mr-6`}
            startAdornment={'$'}
            value={`${storeCut}`}
          />
          <TextField
            displayOnly={true}
            inputLabel="MARGIN"
            error={storeCut < 0}
            className="w-24 mr-12"
            endAdornment={'%'}
            value={`${profitMargin || 0}`}
          />
          <TextField
            inputLabel="QUANTITY"
            className="w-24"
            // inputType="number"
            error={parseInt(receiveItem?.quantity) < 1}
            min={0}
            value={`${receiveItem?.quantity || ''}`}
            onChange={(e: any) =>
              updateReceiveBasketItem(receiveItem?.key, {
                quantity: e.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  )
}