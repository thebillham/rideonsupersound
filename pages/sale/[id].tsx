import { useEffect, useState } from 'react'
import { ModalButton, SaleItemObject, SaleObject } from 'lib/types'

// Components
import ScreenContainer from 'components/container/screen'

import { saveSystemLog } from 'lib/functions/log'
import DeleteIcon from '@mui/icons-material/Delete'
import { useAppStore } from 'lib/store'
import { useClerk } from 'lib/api/clerk'
import { useRouter } from 'next/router'
import { useCustomers } from 'lib/api/customer'
import { useGiftCards, useStockList } from 'lib/api/stock'
import { useCurrentRegisterId } from 'lib/api/register'
import SaleSummary from 'features/pay/components/sale-summary'
import SaleDetails from 'features/pay/components/sale-details'
import { useSaleProperties } from 'lib/hooks'
import Layout from 'components/layout'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'

// TODO add returns to sale items
// TODO refund dialog like PAY, refund with store credit, cash or card

export default function SaleItemScreen() {
  const router = useRouter()
  const { id } = router.query
  const { clerk } = useClerk()
  const { cart, setCart, openConfirm } = useAppStore()

  // SWR
  const { customers } = useCustomers()
  const { items, isSaleItemsLoading } = useSaleItemsForSale(Number(id))
  const { transactions, isSaleTransactionsLoading } =
    useSaleTransactionsForSale(Number(id))
  const { sales, mutateSales } = useSales()
  const { registerId } = useCurrentRegisterId()

  // State
  const [saleLoading, setSaleLoading] = useState(false)
  const [loadToCartLoading, setLoadToCartLoading] = useState(false)
  const [nukeSaleLoading, setNukeSaleLoading] = useState(false)

  // State
  const [sale, setSale]: [SaleObject, Function] = useState({})

  // Load
  useEffect(() => {
    setSaleLoading(true)
    if (!isSaleItemsLoading && !isSaleTransactionsLoading) {
      let loadedSale =
        sales?.find((s: SaleObject) => s?.id === Number(id)) || {}
      loadedSale.items = items
      loadedSale.transactions = transactions
      console.log(loadedSale)
      setSale(loadedSale)
      setSaleLoading(false)
    }
  }, [isSaleItemsLoading, isSaleTransactionsLoading])

  // TODO make sale info screen for LAYBY and SALES screen that needs to be activated to go to the SELL screen. So only one active sale will be present at a time.
  // BUG fix bug where close register screen appears (pressing TAB) - have fixed by just hiding sidebars and screens
  // BUG fix bug where bottom of dialog is visible
  // BUG dates are wrong on vercel
  // BUG why are some sales showing items as separate line items, not 2x quantity

  const { totalRemaining } = useSaleProperties(sale)

  // Functions
  async function loadSale() {
    saveSystemLog('LOAD SALE clicked.', clerk?.id)
    setLoadToCartLoading(true)
    await loadSaleToCart(cart, setCart, sale, clerk, registerId, customers)
    setLoadToCartLoading(false)
    router.push('sell/')
    // setView({ ...view, saleScreen: true })
  }

  async function nukeSale() {
    saveSystemLog('SALE NUKED', clerk?.id)
    await nukeSaleInDatabase(sale, clerk, registerID)
    setSale(null)
    router.back()
  }

  // Constants
  const buttons: ModalButton[] = [
    // {
    //   type: "cancel",
    //   onClick: () => {
    //     saveSystemLog("NUKE SALE clicked.", clerk?.id);
    //     setConfirmModal({
    //       open: true,
    //       title: "Are you sure you want to delete this sale?",
    //       styledMessage: (
    //         <span>
    //           This will delete the sale and all associated transactions. There
    //           is no coming back.
    //         </span>
    //       ),
    //       yesText: "YES, I'M SURE",
    //       action: nukeSale,
    //     });
    //   },
    //   loading: nukeSaleLoading,
    //   text: "NUKE SALE",
    // },
    {
      type: 'ok',
      onClick: loadSale,
      loading: loadToCartLoading,
      text: totalRemaining === 0 ? 'RETURN ITEMS' : 'LOAD SALE TO CART',
    },
  ]

  return (
    <>
      {/* <ScreenContainer
        title={`SALE #${sale?.id} [${sale?.state ? sale?.state.toUpperCase() : 'IN PROGRESS'}]`}
        loading={saleLoading}
        buttons={sale?.items?.filter(
          (s: SaleItemObject) => !s?.isRefunded && !s?.isDeleted
        )?.length > 0
          ? buttons
          : null}
        titleClass={titleClass} show={false} children={undefined}      > */}
      <div>
        <div className="flex items-start overflow-auto w-full">
          <div className="w-2/3">
            <SaleSummary sale={sale} />
          </div>
          <div className="w-1/3 p-2 flex flex-col justify-between">
            <SaleDetails sale={sale} />
            <div className="flex justify-start py-2">
              <button
                className="p-1 border border-black hover:bg-tertiary rounded-xl mt-2"
                onClick={() => {
                  saveSystemLog('NUKE SALE clicked.', clerk?.id)
                  openConfirm({
                    open: true,
                    title: 'Are you sure you want to delete this sale?',
                    styledMessage: (
                      <span>
                        This will delete the sale and all associated
                        transactions. There is no coming back.
                      </span>
                    ),
                    yesText: "YES, I'M SURE",
                    action: nukeSale,
                  })
                }}
              >
                <DeleteIcon />
                Nuke Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

SaleItemScreen.getLayout = (page) => <Layout>{page}</Layout>

export const getServerSideProps = withPageAuthRequired()
