import connection from './conn'
import { dbGetVendorIdFromUid } from './vendor'

export function dbGetAllVendorPayments(db = connection) {
  return db('vendor_payment').where(`is_deleted`, 0)
}

export function dbGetVendorPaymentsByVendorId(vendorId, db = connection) {
  return db('vendor_payment')
    .select('date', 'amount')
    .where({ vendor_id: vendorId })
    .andWhere(`is_deleted`, 0)
}

export function dbGetVendorPaymentsByVendorUid(vendorUid, db = connection) {
  return dbGetVendorIdFromUid(vendorUid).then((vendorId) =>
    db('vendor_payment')
      .where({ vendor_id: vendorId })
      .andWhere(`is_deleted`, 0)
      .orderBy('date', 'desc')
  )
}

export function dbGetVendorStoreCreditByVendorUid(vendorUid, db = connection) {
  return null
  // return dbGetVendorIdFromUid(vendorUid).then(vendorId => db('sale'))
  // return {
  //   table: 'sale',
  //   columns: 'item_list',
  //   innerJoin: [{}],
  // }
}