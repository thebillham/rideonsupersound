// import connection from './conn'
const connection = require('./conn')

export function dbGetStockList(db = connection) {
  return db('stock')
    .join('stock_movement', 'stock.id', '=', 'stock_movement.stock_id')
    .join('stock_price', 'stock.id', '=', 'stock_price.stock_id')
    .groupBy('stock.id')
    .select(
      'stock.id',
      'stock.vendor_id as vendorId',
      'stock.artist',
      'stock.title',
      'stock.display_as as displayAs',
      'stock.media',
      'stock.format',
      'stock.section',
      'stock.country',
      'stock.is_new as isNew',
      'stock.cond',
      'stock.image_url as imageUrl',
      'stock.needs_restock as needsRestock',
      'stock_price.vendor_cut as vendorCut',
      'stock_price.total_sell as totalSell'
    )
    .sum('stock_movement.quantity as quantity')
    .where(`stock.is_deleted`, 0)
    .andWhere(`stock.is_misc_item`, 0)
    .andWhere(`stock.is_gift_card`, 0)
    .andWhereRaw(
      `(stock_price.id = (SELECT MAX(id) FROM stock_price WHERE stock_id = stock.id))`
    )
}

export function dbGetRestockList(db = connection) {
  return db('stock')
    .select(
      'id',
      'vendor_id as vendorId',
      'artist',
      'title',
      'media',
      'format',
      'section'
    )
    .where(`needs_restock`, 1)
    .andWhere('is_deleted', 0)
}

export function dbGetStockItem(id, db = connection) {
  return db('stock')
    .join('stock_movement', 'stock.id', '=', 'stock_movement.stock_id')
    .join('stock_price', 'stock.id', '=', 'stock_price.stock_id')
    .groupBy('stock.id')
    .select(
      'stock.id',
      'stock.vendor_id as vendorId',
      'stock.artist',
      'stock.title',
      'stock.display_as as displayAs',
      'stock.media',
      'stock.format',
      'stock.section',
      'stock.country',
      'stock.is_new as isNew',
      'stock.cond',
      'stock.image_url as imageUrl',
      'stock.needs_restock as needsRestock',
      'stock_price.vendor_cut as vendorCut',
      'stock_price.total_sell as totalSell'
    )
    .sum('stock_movement.quantity as quantity')
    .where(`stock.id`, Number(id))
    .where(`stock.is_deleted`, 0)
    .andWhere(`stock.is_misc_item`, 0)
    .andWhere(`stock.is_gift_card`, 0)
    .andWhereRaw(
      `(stock_price.id = (SELECT MAX(id) FROM stock_price WHERE stock_id = stock.id))`
    )
}
