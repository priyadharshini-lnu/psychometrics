import { createRoot } from 'react-dom/client'
import { Button } from 'antd'
import { LeftOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import setLocale from '~/utils/setLocale'

setLocale()

const { I18n } = window

/** Where to land when there is no history to go back to. */
const FALLBACK_PATH = '/admin/clients'

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
    return
  }
  window.location.href = FALLBACK_PATH
}

// The only chrome on a Rails-rendered admin page under the revamp; goes away as pages join the SPA.
const BackBar = () => (
  <div style={{ padding: '0.75rem 1rem' }}>
    <Button
      type="text"
      icon={<LeftOutlined aria-hidden="true" />}
      onClick={goBack}
    >
      {I18n.t('admin.go_back', { defaultValue: 'Back' })}
    </Button>
  </div>
)

const container = document.getElementById('admin-back-bar')
if (container) createRoot(container).render(<BackBar />)
