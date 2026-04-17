import { useState, useEffect } from 'react'

export const useOsanoDialogOpen = () => {
  const [dialogOpen, setDialogOpen] = useState(() => window.Osano?.cm?.dialogOpen ?? false)

  useEffect(() => {
    const handleUiChanged = (component: string, stateChange: string) => {
      if (component === 'dialog') {
        setDialogOpen(stateChange === 'show')
      }
    }
    window.Osano?.cm?.addEventListener('osano-cm-ui-changed', handleUiChanged)
    return () => window.Osano?.cm?.removeEventListener('osano-cm-ui-changed', handleUiChanged)
  }, [])

  return dialogOpen
}
