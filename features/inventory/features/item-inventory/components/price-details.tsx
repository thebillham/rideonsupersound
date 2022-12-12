import { getGrossProfit, getProfitMargin } from 'features/pay/lib/functions'
import { useAppStore } from 'lib/store'
import { ViewProps } from 'lib/store/types'
import { StockObject } from 'lib/types'

interface priceDetailsProps {
  item: StockObject
}

export default function PriceDetails({ item }: priceDetailsProps) {
  const { view, openView } = useAppStore()

  return (
    <>
      <div className="grid grid-cols-6 gap-2 mt-4 mb-4">
        <div>
          {(!item?.isNew && !item?.cond) ||
          !(
            item?.discogsItem?.priceSuggestions &&
            item?.discogsItem?.priceSuggestions[
              item?.isNew ? 'Mint (M)' : item?.cond || 'Good (G)'
            ]?.value
          ) ? (
            <div />
          ) : (
            <>
              <div className="px-1 text-xs mt-2 mb-2">DISCOGS</div>
              <div className="font-bold text-xl">
                {`$${parseFloat(
                  item?.discogsItem?.priceSuggestions[
                    item?.isNew ? 'Mint (M)' : item?.cond || 'Good (G)'
                  ]?.value
                )?.toFixed(2)}`}
              </div>
            </>
          )}
        </div>
        <div>
          <div className="px-1 text-xs mt-2 mb-2">COST PRICE</div>
          <div className="font-bold text-xl">
            {item?.vendorCut
              ? `$${(item?.vendorCut / 100)?.toFixed(2)}`
              : 'N/A'}
          </div>
        </div>
        <div>
          <div className="px-1 text-xs mt-2 mb-2">STORE CUT</div>
          <div className="font-bold text-xl">
            {getGrossProfit(item) || 'N/A'}
          </div>
        </div>
        <div>
          <div className="px-1 text-xs mt-2 mb-2">MARGIN</div>
          <div className="font-bold text-xl">
            {getProfitMargin(item) || 'N/A'}
          </div>
        </div>
        <div className="col-start-5 col-end-7">
          <div className="flex justify-center items-center p-4 bg-tertiary-dark">
            <div className="font-bold text-4xl text-white">
              {item?.totalSell
                ? `$${(item?.totalSell / 100)?.toFixed(2)}`
                : 'N/A'}
            </div>
          </div>
          <button
            onClick={() => openView(ViewProps.changePriceDialog)}
            className="bg-brown-dark hover:bg-brown p-2 w-full text-white"
          >
            CHANGE PRICE
          </button>
        </div>
      </div>
    </>
  )
}