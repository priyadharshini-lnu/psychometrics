import { Button } from 'antd'
import { useOsanoDialogOpen } from '~/hooks/useOsanoDialogOpen'

const { I18n } = window

export const ManageCookiesButton = () => {
  const osanoDialogOpen = useOsanoDialogOpen()

  if (!window.Osano?.cm || osanoDialogOpen) return null

  return (
    <Button
      className="ps-0 pe-0"
      type="link"
      onClick={() => window.Osano?.cm.showDrawer('osano-cm-dom-info-dialog-open')}
      style={{
        whiteSpace: 'break-spaces',
        lineHeight: '22px',
        verticalAlign: 'text-top',
        textAlign: 'center',
      }}

    >
      {I18n.t('shared.manage_cookies')}
    </Button>
  )
}
