import { saveSystemLog } from 'features/log/lib/functions'
import { createStocktakeTemplateInDatabase } from 'lib/database/create'
import { StocktakeTemplateObject } from 'lib/types'
import NewIcon from '@mui/icons-material/AddBox'
import { useState } from 'react'
import { useClerk } from 'lib/api/clerk'
import { ViewProps } from 'lib/store/types'
import { useAppStore } from 'lib/store'

export default function StocktakeNavActions() {
  const { clerk } = useClerk()
  const { openView, setLoadedStocktakeTemplateId } = useAppStore()
  // const { stocktakeTemplates, mutateStocktakeTemplates } =
  //   useStocktakeTemplates()
  const [isLoading, setIsLoading] = useState(false)
  return (
    <div className="flex">
      <button
        disabled={isLoading}
        className="icon-text-button"
        onClick={async () => {
          setIsLoading(true)
          saveSystemLog('Stocktake Nav - New Stocktake clicked.', clerk?.id)
          let newStocktakeTemplate: StocktakeTemplateObject = {
            formatEnabled: true,
          }
          const id = await createStocktakeTemplateInDatabase(
            newStocktakeTemplate
          )
          // mutateStocktakeTemplates(
          //   [{ id, format_enabled: true, name: '' }, ...stocktakeTemplates],
          //   false
          // )
          setLoadedStocktakeTemplateId(id)
          openView(ViewProps.stocktakeTemplateScreen)
          setIsLoading(false)
        }}
      >
        <NewIcon className="mr-1" />
        New Stocktake Template
      </button>
    </div>
  )
}