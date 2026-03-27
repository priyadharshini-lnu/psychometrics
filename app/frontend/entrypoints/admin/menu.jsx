import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '~/modules/admin/store'
import { PortalMenu } from '~/components/MainMenu'
import setLocale from '~/utils/setLocale'

setLocale()
const MenuApp = () => (
  <div className="ms" style={{ background: 'white' }}>
    <Provider store={store}>
      <PortalMenu />
    </Provider>
  </div>
)

const root = createRoot(document.getElementById('main_menu'))
root.render(<MenuApp />)
