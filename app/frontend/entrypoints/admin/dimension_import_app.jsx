import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '~/modules/admin/styles/common.less'
import { DimensionImportModal } from '~/modules/admin/modules/DimensionImport'

const mounts = new Map()

const DimensionImportMount = ({ afterClose }) => {
  const [open, setOpen] = useState(true)

  return <DimensionImportModal open={open} close={() => setOpen(false)} afterClose={afterClose} />
}

window.renderDimensionImportModal = (containerId) => {
  const container = document.getElementById(containerId)
  if (!container) {
    console.error(`Container with ID "${containerId}" not found`)
    return
  }

  const mount = mounts.get(container) || { root: createRoot(container), openings: 0 }
  mounts.set(container, mount)
  mount.openings += 1

  const opening = mount.openings
  const unmount = () => {
    if (mount.openings === opening) mount.root.render(null)
  }

  mount.root.render(<DimensionImportMount key={opening} afterClose={unmount} />)
}
