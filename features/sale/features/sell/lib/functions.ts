import {
  getItemDisplayName,
  getItemSku,
} from 'features/inventory/features/display-inventory/lib/functions'
import { saveLog } from 'features/log/lib/functions'
import { GiftCardObject, SaleItemObject, StockObject } from 'lib/types'
import { priceCentsString } from 'lib/utils'

export function writeCartItemPriceBreakdown(
  cartItem: SaleItemObject,
  item?: StockObject
) {
  // Writes out the sale item in the following form:
  // 1 x V10% x R50% x $27.00
  return item?.isGiftCard
    ? `${priceCentsString(item?.giftCardAmount)} GIFT CARD`
    : item?.isMiscItem
    ? `${cartItem?.quantity} × ${priceCentsString(item?.miscItemAmount)}`
    : `${cartItem?.quantity}${
        parseInt(cartItem?.vendorDiscount) > 0
          ? ` × V${cartItem?.vendorDiscount}%`
          : ''
      }${
        parseInt(cartItem?.storeDiscount) > 0
          ? ` × S${cartItem?.storeDiscount}%`
          : ''
      } × ${priceCentsString(cartItem?.totalSell ?? item?.totalSell)}`
}

export function getDiscountedPrice(
  cost: number | string,
  discount: number | string,
  quantity: number | string
) {
  return (
    (parseInt(`${quantity}`) ?? 1) *
    ((parseFloat(`${cost}`) || 0) *
      (1 - (parseFloat(`${discount}`) || 0) / 100))
  )
}

export function getCartItemVendorCut(cartItem: SaleItemObject, item) {
  const vendorCut: number = cartItem?.vendorCut ?? item?.vendorCut
  const vendorPrice: number = getDiscountedPrice(
    vendorCut,
    cartItem?.vendorDiscount,
    cartItem?.quantity
  )
  return vendorPrice
}

export function getCartItemStoreCut(cartItem, item) {
  // const vendorCut = getCartItemVendorCut(cartItem, item)
  const storeCut = getStoreCut(item)
  // console.log(cartItem?.totalSell ?? item?.totalSell)
  const storePrice: number = getDiscountedPrice(
    storeCut,
    cartItem?.storeDiscount,
    cartItem?.quantity
  )
  // console.log({ storeCut, storePrice })
  return storePrice
}

export function getCartItemTotal(cartItem, item) {
  // console.log(cartItem)
  // console.log(item)
  const totalSell: number = !cartItem
    ? 0
    : item?.isGiftCard
    ? item?.giftCardAmount || 0
    : item?.isMiscItem
    ? item?.miscItemAmount || 0
    : null
  if (totalSell) return totalSell
  const vendorPrice: number = getCartItemVendorCut(cartItem, item)
  const storePrice: number = getCartItemStoreCut(cartItem, item)
  const totalPrice: number = totalSell ?? storePrice + vendorPrice
  // console.log({ vendorPrice, storePrice, totalPrice })
  return totalPrice
}

export function getCartItemPrice(cartItem: any, item: StockObject) {
  // Gets three prices for each sale item: the vendor cut, store cut, and total
  // Price is returned in cents
  return {
    storePrice: getCartItemStoreCut(cartItem, item),
    vendorPrice: getCartItemVendorCut(cartItem, item),
    totalPrice: getCartItemTotal(cartItem, item),
  }
}

export function getStoreCut(item: StockObject) {
  if (item?.isMiscItem) return item?.miscItemAmount || 0
  if (!item?.totalSell || !item?.vendorCut) return 0
  return item?.totalSell - item?.vendorCut
}

export function getItemQuantity(
  item: StockObject,
  saleItems: SaleItemObject[]
) {
  const saleItem = saleItems?.find(
    (i: SaleItemObject) => i?.itemId === item?.id
  )
  const cartQuantity = saleItem?.quantity || '0'
  const itemQuantity = item?.quantity || 0
  return itemQuantity - parseInt(cartQuantity)
}

export function filterInventory(item, searchString) {
  if (!searchString || searchString === '') return []
  let res = true
  let terms = searchString.split(' ')
  let itemMatch = `
      ${getItemSku(item) || ''}
      ${item?.artist || ''}
      ${item?.title || ''}
      ${item?.format || ''}
      ${item?.genre || ''}
      ${item?.country || ''}
      ${item?.section || ''}
      ${item?.tags ? item?.tags?.join(' ') : ''}
      ${item?.vendorName || ''}
      ${item?.googleBooksItem?.volumeInfo?.authors?.join(' ') || ''}
      ${item?.googleBooksItem?.volumeInfo?.publisher || ''}
      ${item?.googleBooksItem?.volumeInfo?.subtitle || ''}
      ${item?.googleBooksItem?.volumeInfo?.categories?.join(' ') || ''}
    `
  terms.forEach((term: string) => {
    if (!itemMatch.toLowerCase().includes(term.toLowerCase())) res = false
  })

  return res
}

export function sortInventory(a: StockObject, b: StockObject) {
  if (a?.quantity === b?.quantity) return 0
  if (a?.quantity < 1) return 1
  if (b?.quantity < 1) return -1
  return 0
}

export function makeGiftCardCode(giftCards: GiftCardObject[], length = 6) {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var charactersLength = characters.length
  let result = ''
  while (
    result === '' ||
    giftCards?.map((g: GiftCardObject) => g?.giftCardCode).includes(result)
  ) {
    result = ''
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
  }
  return result
}

function getIndexOfItemInCart(item, cart) {
  return (
    cart?.items?.findIndex?.((cartItem) => cartItem.item_id === item?.id) || -1
  )
}

function addNewItemToCart(item, cart, clerk) {
  const newItems = cart?.items || []
  newItems.push({
    item_id: item?.id,
    quantity: '1',
  })
  saveLog(
    `${getItemDisplayName(item)} added to cart${
      cart?.id ? ` (sale #${cart?.id})` : ''
    }.`,
    clerk?.id
  )
  return newItems
}

function updateItemQuantityInCart(item, cart, clerk, quantity = 1) {
  const newItems = cart?.items || []
  const index = getIndexOfItemInCart(item, cart)
  newItems[index].quantity = `${parseInt(newItems[index].quantity) + quantity}`
  saveLog(
    `${quantity} more ${getItemDisplayName(item)} added to cart${
      cart?.id ? ` (sale #${cart?.id})` : ''
    }.`,
    clerk?.id
  )
  return newItems
}

export function addItemToCart(item, cart, setCart, clerk) {
  const index = getIndexOfItemInCart(item, cart)
  const newItems =
    index < 0
      ? addNewItemToCart(item, cart, clerk)
      : updateItemQuantityInCart(item, cart, clerk)
  setCart({ ...cart, items: newItems })
}

export function skuScan(inputValue, item, callbackFunction) {
  if (inputValue?.trim() === `${('00000' + item?.id || '').slice(-5)}`) {
    callbackFunction()
  }
}
