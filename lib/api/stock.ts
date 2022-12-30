import { ClerkObject } from 'lib/types'
import { SaleItemObject } from 'lib/types/sale'
import { StockObject, StockPriceObject, StocktakeTemplateObject } from 'lib/types/stock'
import { axiosAuth, useData } from './'

export function useStockList() {
  return useData(`stock`, 'stockList')
}

export function useBasicStockItem(id: string | number) {
  return useData(`stock/${id}?basic=true`, 'stockItem')
}

export function useStockItem(id: string | number) {
  return useData(`stock/${id}`, 'stockItem')
}

export function useSaleStockItems(items: SaleItemObject[]) {
  return useData(
    `stock/items${items?.length > 0 ? `?items=${items?.map((item) => item?.itemId)?.join('+')}` : ''}`,
    'saleItems',
  )
}

export function useRestockList() {
  return useData(`stock/restock`, 'restockList')
}

export function useGiftCards() {
  return useData(`stock/giftcard`, 'giftCards')
}

export function deleteStockItem(id) {
  return axiosAuth
    .post(`/api/stock/delete/${id}`)
    .then((res) => res.data)
    .catch((e) => Error(e.message))
}

export function createStockItem(stockItem: StockObject, clerk: ClerkObject) {
  return axiosAuth
    .post(`/api/stock`, {
      ...stockItem,
      createdByClerkId: clerk?.id,
    })
    .then((ids) => {
      return { ...stockItem, createdByClerkId: clerk?.id, id: ids[0] }
    })
}

export function createStockPrice(stockPrice: StockPriceObject) {
  console.log(stockPrice)
  return axiosAuth.post(`/api/stock/price`, stockPrice).then((res) => {
    const id = res.data
    // saveSystemLog(`New stock (${id}) created.`, clerk?.id)
    return { ...stockPrice, id }
  })
}

export function receiveStock(receiveStock: any) {
  return axiosAuth.patch(`/api/stock/receive`, receiveStock)
}

export function returnStock(returnStock: any) {
  return axiosAuth.patch(`/api/stock/return`, returnStock)
}

export function changeStockQuantity(update: any, id) {
  console.log(update)
  // TODO does this need to be its own thing
  return axiosAuth.patch(`/api/stock/${id}/quantity`, update)
}

export function updateStockItem(update: any, id) {
  return axiosAuth.patch(`/api/stock/${id}`, update)
}

export function createStocktakeTemplate(stocktakeTemplate: StocktakeTemplateObject, clerk: ClerkObject) {
  return axiosAuth
    .post(`/api/stocktake/template`, {
      ...stocktakeTemplate,
      createdByClerkId: clerk?.id,
    })
    .then((id) => {
      // saveSystemLog(`New stock (${id}) created.`, clerk?.id)
      return { ...stocktakeTemplate, id }
    })
}

export function useStocktakeTemplates() {
  return useData(`stocktake/template`, 'stocktakeTemplates')
}
