import { axiosAuth, useData } from './'

export function useVendors() {
  return useData(`vendor`, 'vendors')
}

export function useVendorAccounts() {
  return useData(`vendor/accounts`, 'vendorAccounts')
}

export function useVendorNames() {
  return useData(`vendor/names`, 'vendorNames')
}

export function useVendorFromVendorPayment(vendorPaymentId) {
  return useData(vendorPaymentId ? `vendor/payment/${vendorPaymentId}` : null, 'vendor')
}

export function useVendor(id) {
  return useData(id ? `vendor/${id}` : null, 'vendor')
}

export function createVendor(vendor) {
  return axiosAuth.post(`/api/vendor`, vendor)
}

export function updateVendor(id, update) {
  return axiosAuth
    .patch(`/api/vendor/${id}`, { update })
    .then((res) => res.data)
    .catch((e) => Error(e.message))
}

export function createVendorPayment(payment) {
  return axiosAuth
    .post(`/api/vendor/payment`, payment)
    .then((res) => {
      return res.data
    })
    .catch((e) => Error(e.message))
}
