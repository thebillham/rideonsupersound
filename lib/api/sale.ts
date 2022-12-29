import { CartObject, ClerkObject, HoldObject, SaleItemObject } from 'lib/types'
import { axiosAuth, useData } from './'

export function useSaleItemsForSale(saleId) {
  return useData(`sale/items/${saleId}`, 'saleItems')
}

export async function saveCart(cart: CartObject, prevState?: string) {
  return axiosAuth.post(`/api/sale/save`, { cart, prevState })
}

export function createSale(sale: any, clerk: ClerkObject) {
  return axiosAuth.post(`/api/sale`, {
    ...sale,
    saleOpenedBy: clerk?.id,
  })
}

export function createHold(hold: HoldObject) {
  return axiosAuth.post(`/api/sale/hold`, hold)
}

export function updateSale(id, update) {
  return axiosAuth.patch(`/api/sale/${id}`, { update })
}

export function createSaleItem(saleItem: SaleItemObject) {
  return axiosAuth.post(`/api/sale/item`, saleItem)
}

export function updateSaleItem(id, update) {
  return axiosAuth.patch(`/api/sale/item/${id}`, { update })
}

export function deleteSale(id, { clerk, registerId }) {
  return axiosAuth.patch(`/api/sale/delete/${id}`, { clerk, registerId })
}

export function deleteSaleItem(id) {
  return axiosAuth.patch(`/api/sale/item/delete/${id}`)
}
