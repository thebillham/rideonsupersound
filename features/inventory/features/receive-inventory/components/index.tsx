import ScreenContainer from 'components/container/screen'
import Stepper from 'components/navigation/stepper'
import { saveSystemLog } from 'features/log/lib/functions'
import { ModalButton } from 'lib/types'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { receiveStock } from '../lib/functions'
import SelectItems from './add-items'
import CheckDetails from './check-details'
import PrintLabel from './print-label'
import SelectVendor from './select-vendor'
import SetPriceAndQuantities from './set-price-and-quantities'
import { useAppStore } from 'lib/store'

export default function ReceiveStockScreen() {
  const { receiveStock, setReceiveStock } = useAppStore()
  // Atoms
  const [basket, setBasket] = useAtom(receiveStockAtom)
  const [, setConfirmModal] = useAtom(confirmModalAtom)
  const { mutateInventory } = useInventory()
  const [view, setView] = useAtom(viewAtom)
  const [clerk] = useAtom(clerkAtom)
  const [step, setStep] = useState(0)
  const [receivedStock, setReceivedStock] = useState(null)
  const [receiveLoading, setReceiveLoading] = useState(false)

  // SWR
  const { registerID } = useRegisterID()

  const buttons: ModalButton[][] = [
    [
      {
        type: 'cancel',
        onClick: () => setView({ ...view, receiveStockScreen: false }),
        text: 'CANCEL',
      },
      {
        type: 'ok',
        text: 'NEXT',
        disabled: !basket?.vendor_id,
        onClick: () => {
          saveSystemLog(`Receive stock screen - Set step 1`, clerk?.id)
          setStep(1)
        },
      },
    ],
    [
      {
        type: 'cancel',
        onClick: () => {
          setConfirmModal({
            open: true,
            title: 'Reset Basket?',
            styledMessage: (
              <span>Are you sure you want to wipe all received items?</span>
            ),
            yesText: "YES, I'M SURE",
            action: () => {
              saveSystemLog(`Receive stock screen - Set step 0`, clerk?.id)
              setStep(0)
              setBasket({})
            },
          })
        },
        text: 'RESET',
      },
      {
        type: 'ok',
        text: 'NEXT',
        disabled: basket?.items?.length === 0,
        onClick: () => {
          saveSystemLog(`Receive stock screen - Set step 2`, clerk?.id)
          setStep(2)
        },
      },
    ],
    [
      {
        type: 'cancel',
        onClick: () => {
          saveSystemLog(`Receive stock screen - Set step 1`, clerk?.id)
          setStep(1)
        },
        text: 'BACK',
      },
      {
        type: 'ok',
        text: 'NEXT',
        onClick: () => {
          saveSystemLog(`Receive stock screen - Set step 3`, clerk?.id)
          setStep(3)
        },
      },
    ],
    [
      {
        type: 'cancel',
        disabled: receiveLoading,
        onClick: () => {
          saveSystemLog(`Receive stock screen - Set step 2`, clerk?.id)
          setStep(2)
        },
        text: 'BACK',
      },
      {
        type: 'ok',
        disabled: isDisabled(),
        loading: receiveLoading,
        text: 'RECEIVE ITEMS',
        onClick: async () => {
          setReceiveLoading(true)
          saveSystemLog(
            `Receive stock screen - Set step 4, receive stock called`,
            clerk?.id
          )
          const receivedStock = await receiveStock(basket, clerk, registerID)
          mutateInventory()
          setReceivedStock(receivedStock)
          setReceiveLoading(false)
          setStep(4)
        },
      },
    ],
    [
      {
        type: 'ok',
        disabled: isDisabled(),
        text: 'DONE',
        onClick: () => {
          saveSystemLog(`Receive stock screen - DONE clicked`, clerk?.id)
          setBasket({})
          setView({ ...view, receiveStockScreen: false })
        },
      },
    ],
  ]

  // TODO make stepper receive
  // Step 1 - select vendor or create new
  // Step 2 - select items, either
  //    from vendor items
  //    from csv
  //    write into table
  //    barcode -> discogs / googlebooks
  // Step 3 - select discogs/googlebooks
  // Step 4 - enter PRICE
  // Step 5 - enter quantity
  // Step 6 - print labels

  return (
    <ScreenContainer
      show={view?.receiveStockScreen}
      closeFunction={() => setView({ ...view, receiveStockScreen: false })}
      title={'RECEIVE STOCK'}
      buttons={buttons[step]}
      titleClass="bg-col2"
    >
      <div className="flex flex-col w-full">
        <Stepper
          steps={[
            'Select vendor',
            'Add items',
            'Check details',
            'Set price and quantities',
            'Print labels',
          ]}
          value={step}
          onChange={setStep}
          disabled
          selectedBg="bg-col2"
          notSelectedBg="bg-gray-200"
          selectedText="text-col2-dark"
          notSelectedText="text-black"
          selectedTextHover="text-col2-dark"
          notSelectedTextHover="text-gray-800"
        />
        {step === 0 && (
          <div>
            <SelectVendor />
          </div>
        )}
        {step === 1 && (
          <div>
            <SelectItems />
          </div>
        )}
        {step == 2 && (
          <div>
            <CheckDetails />
          </div>
        )}
        {step == 3 && (
          <div>
            <SetPriceAndQuantities />
          </div>
        )}
        {step == 4 && (
          <div>
            <PrintLabel receivedStock={receivedStock} />
          </div>
        )}
      </div>
    </ScreenContainer>
  )

  function isDisabled() {
    console.log(basket)
    return (
      !basket?.vendor_id ||
      basket?.items?.length === 0 ||
      basket?.items?.filter(
        (item) =>
          // !item?.item?.section ||
          item?.item?.is_new === null ||
          // (!item?.item?.is_new && !item?.item?.cond) ||
          !Number.isInteger(parseInt(`${item?.quantity}`)) ||
          !(
            (Number.isInteger(parseInt(`${item?.vendor_cut}`)) &&
              Number.isInteger(parseInt(`${item?.total_sell}`))) ||
            item?.item?.id
          )
      ).length > 0
    )
  }
}
