import { useOsanoDialogOpen } from '~/hooks/useOsanoDialogOpen'

export const useManageCookies = () => {
  const osanoDialogOpen = useOsanoDialogOpen()

  return {
    available: Boolean(window.Osano?.cm) && !osanoDialogOpen,
    openDrawer: () => window.Osano?.cm.showDrawer('osano-cm-dom-info-dialog-open'),
  }
}
