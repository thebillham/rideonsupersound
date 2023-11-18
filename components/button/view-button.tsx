import { Apps, List, TableChart } from '@mui/icons-material'
import { useAppStore } from 'lib/store'

interface ViewModeTypes {
  icon: any
  tooltip: string
  mode: 'table' | 'list' | 'sheet'
}

const ViewButton = () => {
  const { viewMode = 'table', setViewMode } = useAppStore()
  const viewModes: ViewModeTypes[] = [
    { icon: <TableChart />, tooltip: 'View as Table', mode: 'table' },
    { icon: <List />, tooltip: 'View as List', mode: 'list' },
    { icon: <Apps />, tooltip: 'View as Data Sheet (Quick Edit)', mode: 'sheet' },
  ]
  return (
    <div>
      {viewModes?.map((mode) => (
        <div
          key={mode.mode}
          className={mode.mode === viewMode ? 'bg-red-500' : 'icon-button'}
          onClick={() => setViewMode(mode.mode)}
        >
          {mode.icon}
        </div>
      ))}
    </div>
  )
}

export default ViewButton
