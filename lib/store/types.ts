/* eslint-disable unused-imports/no-unused-vars */
import { ConfirmModal, AlertProps } from 'lib/types'
import { CartObject, SaleItemObject, SaleTransactionObject } from 'lib/types/sale'

export interface StoreState {
  view: {
    mainMenu?: boolean
    cart?: boolean
    checkHoldsDialog?: boolean
    createHold?: boolean
    createLayby?: boolean
    createMailOrder?: boolean
    createCustomer?: boolean
    closeRegisterScreen?: boolean
    receiveStockScreen?: boolean
    returnStockScreen?: boolean
    stockEditDialog?: boolean
    changePriceDialog?: boolean
    changeStockQuantityDialog?: boolean
    helpDialog?: boolean
    returnCashDialog?: boolean
    takeCashDialog?: boolean
    batchVendorPaymentDialog?: boolean
    batchVendorPaymentScreen?: boolean
    transferVendorPaymentDialog?: boolean
    cashVendorPaymentDialog?: boolean
    acctPaymentDialog?: boolean
    cardPaymentDialog?: boolean
    cashPaymentDialog?: boolean
    giftPaymentDialog?: boolean
    giftCardDialog?: boolean
    miscItemDialog?: boolean
    holdDialog?: boolean
    labelPrintDialog?: boolean
    loadSalesDialog?: boolean
    refundPaymentDialog?: boolean
    returnItemDialog?: boolean
    splitSaleDialog?: boolean
    saleScreen?: boolean
    taskDialog?: boolean
    stocktakeScreen?: boolean
    stocktakeTemplateScreen?: boolean
    stocktakeTemplateSetupDialog?: boolean
  }
  confirmModal?: ConfirmModal
  alert?: AlertProps
  cart: CartObject
  receiveBasket?: {
    items: any[]
    clerkId?: number
    registerId?: number
    vendorId?: number
  }
  sellPage?: {
    searchBar?: string
    isSearching?: boolean
    bypassRegister?: boolean
    createableCustomerName?: string
  }
  inventoryPage?: any
  vendorsPage?: any
  paymentsPage?: any
  registersPage?: any
  salesPage?: {
    viewPeriod?: string
    rangeStartDate?: string
    rangeEndDate?: string
    clerkIds?: number[]
    viewLaybysOnly?: boolean
  }
  laybysPage?: any
  holdsPage?: any
  giftCardsPage?: {
    searchBar?: string
    loadedGiftCard?: number
  }
  logsPage?: any
  jobsPage?: any
  stocktakesPage?: any
  openView: (view: ViewProps) => void
  closeView: (view: ViewProps) => void
  openConfirm: (confirm: any) => void
  closeConfirm: () => void
  setAlert: (alert: any) => void
  closeAlert: () => void
  setCart: (update: any) => void
  mutateCart: (mutates?: string[]) => void
  addCartTransaction: (transaction: SaleTransactionObject) => void
  deleteCartTransaction: (transaction: SaleTransactionObject) => void
  addCartItem: (newItem: SaleItemObject, clerkId: number) => void
  setCartItem: (id: number, update: any) => void
  setCartSale: (update: any) => void
  setReceiveBasket: (update: any) => void
  addReceiveBasketItem: (newItem: any) => void
  updateReceiveBasketItem: (key: any, update: any) => void
  resetCart: () => void
  resetReceiveBasket: () => void
  resetCustomer: () => void
  setSearchBar: (page: Pages, val: string) => void
  setPage: (page: Pages, update: any) => void
  togglePageOption: (page: Pages, option: string) => void
  resetSearchBar: (page: Pages) => void
  resetPage: (page: Pages) => void
}

export enum ViewProps {
  mainMenu = 'mainMenu',
  cart = 'cart',
  checkHoldsDialog = 'checkHoldsDialog',
  createHold = 'createHold',
  createLayby = 'createLayby',
  createMailOrder = 'createMailOrder',
  createCustomer = 'createCustomer',
  closeRegisterScreen = 'closeRegisterScreen',
  receiveStockScreen = 'receiveStockScreen',
  returnStockScreen = 'returnStockScreen',
  stockEditDialog = 'stockEditDialog',
  changePriceDialog = 'changePriceDialog',
  changeStockQuantityDialog = 'changeStockQuantityDialog',
  helpDialog = 'helpDialog',
  returnCashDialog = 'returnCashDialog',
  takeCashDialog = 'takeCashDialog',
  batchVendorPaymentDialog = 'batchVendorPaymentDialog',
  batchVendorPaymentScreen = 'batchVendorPaymentScreen',
  transferVendorPaymentDialog = 'transferVendorPaymentDialog',
  cashVendorPaymentDialog = 'cashVendorPaymentDialog',
  acctPaymentDialog = 'acctPaymentDialog',
  cardPaymentDialog = 'cardPaymentDialog',
  cashPaymentDialog = 'cashPaymentDialog',
  giftPaymentDialog = 'giftPaymentDialog',
  giftCardDialog = 'giftCardDialog',
  miscItemDialog = 'miscItemDialog',
  holdDialog = 'holdDialog',
  labelPrintDialog = 'labelPrintDialog',
  loadSalesDialog = 'loadSalesDialog',
  refundPaymentDialog = 'refundPaymentDialog',
  returnItemDialog = 'returnItemDialog',
  splitSaleDialog = 'splitSaleDialog',
  saleScreen = 'saleScreen',
  taskDialog = 'taskDialog',
  stocktakeScreen = 'stocktakeScreen',
  stocktakeTemplateScreen = 'stocktakeTemplateScreen',
  stocktakeTemplateSetupDialog = 'stocktakeTemplateSetupDialog',
}

export enum Pages {
  sellPage = 'sellPage',
  inventoryPage = 'inventoryPage',
  vendorsPage = 'vendorsPage',
  paymentsPage = 'paymentsPage',
  registersPage = 'registersPage',
  salesPage = 'salesPage',
  laybysPage = 'laybysPage',
  holdsPage = 'holdsPage',
  giftCardsPage = 'giftCardsPage',
  logsPage = 'logsPage',
  jobsPage = 'jobsPage',
  stocktakesPage = 'stocktakesPage',
}
