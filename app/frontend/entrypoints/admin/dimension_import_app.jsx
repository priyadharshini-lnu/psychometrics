import { createRoot } from 'react-dom/client'
import '~/modules/admin/styles/common.less'
import { DimensionImportModal } from '~/modules/admin/modules/DimensionImport'
import setLocale from '~/utils/setLocale'

setLocale()

window.renderDimensionImportModal = (containerId) => {
  const container = document.getElementById(containerId)
  if (container) {
    const root = createRoot(container)
    root.render(<DimensionImportModal />)
  } else {
    console.error(`Container with ID "${containerId}" not found`)
  }
}
