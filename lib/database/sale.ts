import connection from './conn'
import dayjs from 'dayjs'
import { RoleTypes } from 'lib/types'
import { PaymentMethodTypes, SaleStateTypes } from 'lib/types/sale'
import { StockMovementTypes } from 'lib/types/stock'
import { VendorPaymentTypes } from 'lib/types/vendor'
import { dbGetCustomer } from './customer'
import { dbCreateJob } from './jobs'
import { dbCreateVendorPayment, dbUpdateVendorPayment } from './payment'
import {
  dbCheckIfRestockNeeded,
  dbCreateStockItem,
  dbCreateStockMovement,
  dbGetStockItems,
  dbUpdateStockItem,
} from './stock'
import { js2mysql } from './utils/helpers'
import { getSaleObjectProps } from 'lib/functions/pay'
import { dollarsToCents } from 'lib/utils'

export function dbGetAllSales(db = connection) {
  return db('sale')
    .select(
      'id',
      'customer_id',
      'state',
      'date_sale_opened',
      'sale_opened_by',
      'date_sale_closed',
      'sale_closed_by',
      'store_cut',
      'total_price',
      'number_of_items',
      'item_list',
    )
    .where(`is_deleted`, 0)
    .orderBy('date_sale_opened', 'desc')
}

export function dbGetAllParkedSales(db = connection) {
  return dbGetAllSales(db).where(`state`, SaleStateTypes.Parked)
}

export function dbGetAllLaybys(db = connection) {
  return dbGetAllSales(db).where(`state`, SaleStateTypes.Layby)
}

export function dbGetAllSalesAndItems(db = connection) {
  return db('sale_item')
    .join('stock', 'sale_item.item_id', 'stock.id')
    .join('sale', 'sale.id', 'sale_item.sale_id')
    .join('stock_price', 'stock_price.stock_id', 'sale_item.item_id')
    .select(
      'sale_item.id',
      'sale_item.sale_id',
      'sale_item.item_id',
      'sale_item.quantity',
      'sale_item.store_discount',
      'sale_item.vendor_discount',
      'sale_item.is_refunded',
      'stock.vendor_id',
      'stock.format',
      'stock.is_gift_card',
      'stock.gift_card_code',
      'stock.is_misc_item',
      'stock.misc_item_description',
      'stock.display_as',
      'stock.artist',
      'stock.title',
      'sale.date_sale_opened',
      'sale.date_sale_closed',
      'sale.store_cut as sale_store_cut',
      'sale.total_price as sale_total_price',
      'sale.number_of_items',
      'sale.item_list',
      'stock_price.vendor_cut as item_vendor_cut',
      'stock_price.total_sell as item_total_sell',
      'stock_price.date_valid_from as date_price_valid_from',
    )
    .where('sale.state', 'completed')
    .where(`sale.is_deleted`, 0)
    .where(`sale_item.is_deleted`, 0)
    .whereRaw(
      `stock_price.id = (
    SELECT MAX(id) FROM stock_price WHERE stock_id = sale_item.item_id AND stock_price.date_valid_from <= sale.date_sale_opened)`,
    )
}

export function dbGetAllHolds(db = connection) {
  return db('hold')
    .leftJoin('stock', 'stock.id', 'hold.item_id')
    .leftJoin('clerk as open_clerk', 'open_clerk.id', 'hold.started_by')
    .leftJoin('clerk as close_clerk', 'close_clerk.id', 'hold.removed_from_hold_by')
    .leftJoin('customer', 'customer.id', 'hold.customer_id')
    .select(
      'hold.*',
      'customer.name as customer_name',
      'stock.artist as artist',
      'stock.title as title',
      'stock.format as format',
      'stock.vendor_id as vendor_id',
      'open_clerk.name as open_clerk_name',
      'close_clerk.name as close_clerk_name',
    )
    .where(`hold.is_deleted`, 0)
    .orderBy('hold.date_created', 'desc')
}

export function dbGetAllCurrentHolds(db = connection) {
  return dbGetAllHolds(db).where(`hold.date_removed_from_hold`, null)
}

export async function dbGetSale(id, db = connection) {
  const saleObject: any = {}
  saleObject.sale = await db('sale').where({ id }).first()
  saleObject.customer = saleObject?.sale?.customer_id ? await dbGetCustomer(saleObject?.sale?.customer_id) : null
  saleObject.items = await dbGetSaleItemsBySaleId(id, db)
  saleObject.stock = await dbGetStockItems(
    saleObject?.items?.map((item) => item?.item_id),
    db,
  )
  saleObject.transactions = await dbGetSaleTransactionsBySaleId(id, db)
  saleObject.props = getSaleObjectProps(saleObject)
  const { totalStoreCut, totalPrice, numberOfItems, itemList } = saleObject?.props || {}
  saleObject.sale = {
    ...saleObject.sale,
    storeCut: dollarsToCents(totalStoreCut),
    totalPrice: dollarsToCents(totalPrice),
    numberOfItems,
    itemList,
  }
  return saleObject
}

export function dbGetSaleItemsBySaleId(saleId, db = connection) {
  return db('sale_item').where({ sale_id: saleId })
}

export function dbGetSaleTransactionsBySaleId(saleId, db = connection) {
  return db('sale_transaction').where({ sale_id: saleId })
}

export function dbGetAllSaleItems(db = connection) {
  return db('sale_item')
}

export function dbCreateSale(sale, db = connection) {
  console.log('creating new sale!...', sale)
  return db('sale')
    .insert(js2mysql(sale))
    .then((rows) => rows[0])
    .catch((e) => {
      console.log(e)
      Error(e.message)
    })
}

export function dbCreateHold(hold, db = connection) {
  return db('hold')
    .insert(js2mysql(hold))
    .then(() =>
      dbCreateStockMovement(
        {
          stockId: hold?.itemId,
          clerkId: hold?.startedBy,
          quantity: hold?.quantity * -1,
          act: StockMovementTypes.Hold,
        },
        db,
      ),
    )
    .then(() => dbCheckIfRestockNeeded(hold?.itemId, db))
}

export function dbUpdateSale(id, update, db = connection) {
  const newUpdate = { ...update }
  if (newUpdate?.weather) delete newUpdate.weather
  return db('sale')
    .where({ id })
    .update(js2mysql(newUpdate))
    .then(() => {
      return id
    })
    .catch((e) => {
      // console.log(e)
      Error(e.message)
    })
}

export function dbUpdateHold(id, update, db = connection) {
  return db('hold')
    .where({ id })
    .update(js2mysql(update))
    .then(() => {
      return id
    })
    .catch((e) => {
      Error(e.message)
    })
}

export function dbCreateSaleItem(saleItem, db = connection) {
  return db('sale_item')
    .insert(js2mysql(saleItem))
    .then((rows) => rows[0])
    .catch((e) => Error(e.message))
}

export function dbUpdateSaleItem(id, update, db = connection) {
  return db('sale_item')
    .where({ id })
    .update(js2mysql(update))
    .catch((e) => Error(e.message))
}

export function dbDeleteSaleItem(id, db = connection) {
  return dbUpdateSaleItem(id, { isDeleted: true }, db).catch((e) => Error(e.message))
}

export function dbDeleteStockMovementForSale(id, db = connection) {
  return db('stock_movement')
    .where({ sale_id: id })
    .update({ is_deleted: 1 })
    .catch((e) => Error(e.message))
}

export function dbCreateSaleTransaction(saleTransaction, db = connection) {
  return db('sale_transaction')
    .insert(js2mysql(saleTransaction))
    .then((rows) => rows[0])
    .catch((e) => Error(e.message))
}

export function dbUpdateSaleTransaction(id, update, db = connection) {
  return db('sale_transaction')
    .where({ id })
    .update(js2mysql(update))
    .catch((e) => Error(e.message))
}

export async function dbSaveCart(cart, prevState, db = connection) {
  console.log('dbSaveCart called', cart)
  return db
    .transaction(async (trx) => {
      const { sale = {}, items = [], transactions = [], registerId = null } = cart || {}
      const newSale = {
        ...sale,
        state: sale?.state || SaleStateTypes.InProgress,
      }
      const newItems = []
      const newTransactions = []

      console.log(newSale)

      if (newSale?.id) {
        dbUpdateSale(newSale?.id, newSale, trx)
      } else {
        newSale.id = await dbCreateSale(newSale, trx)
      }
      if (sale?.isMailOrder && sale?.state === SaleStateTypes.Completed) {
        const customer = await dbGetCustomer(sale?.customerId, trx)
        const mailOrderJob = {
          description: `Post Sale ${sale?.id} (${sale?.itemList}) to ${`${customer?.name}\n` || ''}${
            sale?.postalAddress
          }`,
          createdByClerkId: sale?.saleOpenedBy,
          assignedTo: RoleTypes?.MC,
          dateCreated: dayjs.utc().format(),
          isPostMailOrder: true,
        }
        console.log('Creating job', mailOrderJob)
        dbCreateJob(mailOrderJob, trx)
      }

      const promises = []

      for (const item of items) {
        promises.push(
          handleSaveSaleItem(item, newSale, prevState, registerId, trx).then((newItem) => newItems.push(newItem)),
        )
      }

      for (const trans of transactions) {
        promises.push(handleSaveSaleTransaction(trans, newSale, trx).then((newTrans) => newTransactions.push(newTrans)))
      }

      return Promise.all(promises)
        .then(async () => {
          const newCart = await dbGetSale(newSale?.id)
          console.log('new Cart issss', newCart)
          return newCart
        })
        .catch((e) => console.error(e.message))
    })
    .then((cart) => {
      return cart
    })
    .catch((e) => Error(e.message))
}

export async function dbDeleteSale(id, db = connection) {
  return db
    .transaction(async (trx) => {
      const sale = await dbGetSale(id, trx)
      await sale?.items?.forEach((saleItem) => {
        dbUpdateSaleItem(saleItem?.id, { isDeleted: true }, trx)
      })
      await dbDeleteStockMovementForSale(sale?.id, trx)
      await sale?.transactions?.forEach((saleTransaction) => {
        if (saleTransaction?.vendorPaymentId)
          dbUpdateVendorPayment(
            saleTransaction?.vendorPaymentId,
            {
              isDeleted: true,
            },
            trx,
          )
        dbUpdateSaleTransaction(saleTransaction?.id, { isDeleted: true }, trx)
      })
      // deleteStockMovementsFromDatabase(sale?.id);
      await dbUpdateSale(id, { isDeleted: true }, trx)
    })
    .then((res) => res)
    .catch((e) => Error(e.message))
}

async function handleSaveSaleItem(item, sale, prevState, registerId, trx) {
  // return db
  //   .transaction(async (trx) => {
  const newItem = { ...item }

  // handle gift cards
  if (item?.isGiftCard) {
    if (sale?.state === SaleStateTypes.Completed) {
      // If sale is completed, validate gift card
      await dbUpdateStockItem(item?.itemId, { giftCardIsValid: true }, trx)
    } else if (prevState === SaleStateTypes.Completed && sale?.state !== SaleStateTypes.Completed) {
      // If sale was complete and is now in progress, invalidate gift card
      await dbUpdateStockItem(item?.itemId, { giftCardIsValid: false }, trx)
    }
  }

  await handleStockMovements(item, sale, prevState, registerId, trx)
  await dbCheckIfRestockNeeded(item?.itemId, trx)

  // Add or update Sale Item
  if (!item?.id) {
    // Item is new to sale
    let newSaleItem = { ...item, saleId: sale?.id }
    const id = await dbCreateSaleItem(newSaleItem, trx)
    newItem.id = id
  } else {
    // Item was already in sale, update in case discount, quantity has changed or item has been deleted
    dbUpdateSaleItem(item?.id, item, trx)
  }
  return newItem
}

async function handleStockMovements(item, sale, prevState, registerId = null, db) {
  // Add stock movement if it's a regular stock item
  if (
    !item?.isGiftCard &&
    !item?.isMiscItem &&
    (sale?.state === SaleStateTypes.Completed ||
      (sale?.state === SaleStateTypes.Layby && prevState !== SaleStateTypes.Layby))
  ) {
    let stockMovement = {
      stockId: item?.itemId,
      clerkId: sale?.saleClosedBy,
      saleId: sale?.id,
      registerId,
      act: StockMovementTypes.Sold,
      quantity: 0,
    }
    if (sale?.state === SaleStateTypes.Completed) {
      // If it was a layby, unlayby it before marking as sold
      if (prevState === SaleStateTypes.Layby && !item?.isGiftCard) {
        stockMovement.act = StockMovementTypes.Unlayby
      }
      if (item?.isRefunded) {
        // Refund item if refunded
        stockMovement.act = StockMovementTypes.Unsold
      }
      // Add layby stock movement if it's a new layby
    } else if (sale?.state === SaleStateTypes.Layby && prevState !== SaleStateTypes.Layby) {
      stockMovement.clerkId = sale?.laybyStartedBy
      stockMovement.act = StockMovementTypes.Layby
    }
    stockMovement.quantity = getStockMovementQuantityByAct(item?.quantity, stockMovement?.act)
    await dbCreateStockMovement(stockMovement, db)
  }
}

export function getStockMovementQuantityByAct(quantity, act) {
  return act === StockMovementTypes.Received ||
    act === StockMovementTypes.Unhold ||
    act === StockMovementTypes.Unlayby ||
    act === StockMovementTypes.Found ||
    act === StockMovementTypes.Unsold ||
    act === StockMovementTypes.Adjustment
    ? parseInt(quantity)
    : -parseInt(quantity)
}

async function handleSaveSaleTransaction(trans, sale, trx) {
  if (!trans?.id) {
    // return db
    //   .transaction(async (trx) => {
    // Transaction is new to sale
    let newSaleTransaction = { ...trans, saleId: sale?.id }
    if (trans?.paymentMethod === PaymentMethodTypes.Account) {
      // Add account payment as a store payment to the vendor
      let vendorPaymentId = null
      const vendorPayment = {
        amount: trans?.amount,
        clerkId: trans?.clerkId,
        vendorId: trans?.vendor?.id,
        type: trans?.isRefund ? VendorPaymentTypes.SaleRefund : VendorPaymentTypes.Sale,
        date: dayjs.utc().format(),
        registerId: trans?.registerId,
      }
      vendorPaymentId = await dbCreateVendorPayment(vendorPayment, trx)
      delete trans?.vendor
      newSaleTransaction = { ...trans, vendorPaymentId }
    }
    if (trans?.paymentMethod === PaymentMethodTypes.GiftCard) {
      if (trans?.isRefund) {
        // Gift card is new, create new one
        let giftCardId = await dbCreateStockItem(trans?.giftCardUpdate, trx)
        newSaleTransaction = { ...newSaleTransaction, giftCardId }
      } else {
        // Update gift card
        await dbUpdateStockItem(trans?.giftCardUpdate, trans?.giftCardUpdate?.id, trx)
      }
      delete newSaleTransaction?.giftCardUpdate
    }
    const id = await dbCreateSaleTransaction(newSaleTransaction, trx)
    return { ...newSaleTransaction, id }
    // })
    // .then((trans) => trans)
    // .catch((e) => Error(e.message))
  }
  return trans
}

export function dbGetSaleTransactions(db = connection) {
  return db('sale_transaction')
    .select(
      `sale_transaction.id`,
      `sale_transaction.sale_id`,
      `sale_transaction.clerk_id`,
      `sale_transaction.date`,
      `sale_transaction.payment_method`,
      `sale_transaction.amount`,
      `sale_transaction.cash_received`,
      `sale_transaction.change_given`,
      `sale_transaction.vendor_payment_id`,
      `sale_transaction.gift_card_id`,
      `sale_transaction.gift_card_taken`,
      `sale_transaction.gift_card_change`,
      `sale_transaction.register_id`,
      `sale_transaction.is_refund`,
      `sale.item_list`,
      `sale.total_price`,
      `sale.store_cut`,
      `sale.number_of_items`,
      `sale.state`,
    )
    .leftJoin('sale', 'sale.id', 'sale_transaction.sale_id')
}

export async function dbGetSalesList(startDate, endDate, clerks, laybysOnly = false, db = connection) {
  console.log(
    'Get sale list',
    startDate,
    endDate,
    clerks?.split(',')?.map((clerk) => Number(clerk)),
    laybysOnly,
  )
  let baseQuery = dbGetSaleTransactions(db)
    .where('sale_transaction.date', '>=', `${dayjs(startDate, 'YYYY-MM-DD').format('YYYY-MM-DD hh:mm:ss')}`)
    .where('sale_transaction.date', '<=', `${dayjs(endDate, 'YYYY-MM-DD').format('YYYY-MM-DD hh:mm:ss')}`)
  if (laybysOnly) baseQuery = baseQuery.where('sale.state', SaleStateTypes.Layby)
  if (clerks?.length > 0)
    baseQuery = baseQuery.whereIn(
      'sale_transaction.clerk_id',
      clerks?.split(',')?.map((clerk) => {
        console.log(clerk)
        console.log(Number(clerk))
        return Number(clerk)
      }),
    )
  // console.log(baseQuery)
  return baseQuery.orderBy('sale_transaction.date')
}
