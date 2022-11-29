import { useState } from 'react'
import { useGiftCards, useInventory, useLogs } from 'lib/database/read'
import TextField from 'components/inputs/text-field'
import Modal from 'components/modal'
import { logNewGiftCardCreated } from 'features/log/lib/functions'
import { getGeolocation, useWeather } from 'lib/api'
import { createStockItemInDatabase } from 'lib/database/create'
import { ModalButton } from 'lib/types'
import SyncIcon from '@mui/icons-material/Sync'
import dayjs from 'dayjs'
import { makeGiftCardCode } from '../../lib/functions'
import { useClerk } from 'lib/api/clerk'
import { useAppStore } from 'lib/store'
import { ViewProps } from 'lib/store/types'

export default function GiftCardDialog() {
  const { clerk } = useClerk()
  const {
    view,
    cart,
    setAlert,
    setCart,
    resetSellSearchBar,
    openView,
    closeView,
  } = useAppStore()
  const { giftCards, mutateGiftCards } = useGiftCards()
  const { logs, mutateLogs } = useLogs()
  const { inventory, mutateInventory } = useInventory()
  const geolocation = getGeolocation()
  const { weather } = useWeather()

  // State
  const [giftCardCode, setGiftCardCode] = useState(makeGiftCardCode(giftCards))
  const [amount, setAmount] = useState('20')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Functions

  const buttons: ModalButton[] = [
    {
      type: 'ok',
      disabled: amount === '' || isNaN(parseFloat(amount)),
      loading: submitting,
      onClick: async () => {
        setSubmitting(true)
        resetSellSearchBar()

        let newGiftCard = {
          is_gift_card: true,
          gift_card_code: giftCardCode,
          gift_card_amount: parseFloat(amount) * 100,
          gift_card_remaining: parseFloat(amount) * 100,
          note: notes,
          gift_card_is_valid: false,
        }
        const id = await createStockItemInDatabase(newGiftCard, clerk)
        giftCards &&
          mutateGiftCards([...giftCards, { ...newGiftCard, id }], false)
        inventory &&
          mutateInventory([...inventory, { ...newGiftCard, id }], false)
        setSubmitting(false)
        setGiftCardCode(null)
        setNotes('')
        setAmount('')

        // Add to cart
        let newItems = cart?.items || []
        newItems.push({
          itemId: id,
          quantity: '1',
          isGiftCard: true,
        })
        setCart({
          id: cart?.id || null,
          // REVIEW check the date to string thing works ok
          date_sale_opened: cart?.dateSaleOpened || dayjs.utc().format(),
          sale_opened_by: cart?.saleOpenedBy || clerk?.id,
          items: newItems,
          weather: cart?.weather || weather,
          geo_latitude: cart?.geoLatitude || geolocation?.latitude,
          geo_longitude: cart?.geoLongitude || geolocation?.longitude,
        })
        closeView(ViewProps.giftCardDialog)
        openView(ViewProps.cart)
        logNewGiftCardCreated(newGiftCard, clerk, id)
        setAlert({
          open: true,
          type: 'success',
          message: `NEW GIFT CARD CREATED`,
        })
      },
      text: 'CREATE GIFT CARD',
    },
  ]

  return (
    <Modal
      open={view?.giftCardDialog}
      closeFunction={() => closeView(ViewProps.giftCardDialog)}
      title={'CREATE GIFT CARD'}
      buttons={buttons}
    >
      <>
        <div className="flex justify-between items-center">
          <div className="text-8xl text-red-800 font-mono">{giftCardCode}</div>
          <button
            className="icon-button-small-mid"
            onClick={() => setGiftCardCode(makeGiftCardCode(giftCards))}
          >
            <SyncIcon />
          </button>
        </div>
        <TextField
          autoFocus
          className="mt-8"
          divClass="text-8xl"
          startAdornment="$"
          inputClass="text-center"
          value={amount}
          error={isNaN(parseFloat(amount))}
          onChange={(e: any) => setAmount(e.target.value)}
        />
        <TextField
          inputLabel="Notes"
          value={notes}
          onChange={(e: any) => setNotes(e.target.value)}
          multiline
          rows={3}
        />
      </>
    </Modal>
  )
}
