import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '~/modules/admin/store'
import { PortalMenu } from '~/components/MainMenu'

const MenuApp = () => (
  <div className="ms" style={{ background: 'white' }}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store}>
      <PortalMenu />
    </Provider>
  </div>
)

const root = createRoot(document.getElementById('main_menu'))
root.render(<MenuApp />)
