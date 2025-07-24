// import './styles/reset.css'
import './styles/main.css'
import { Provider } from 'react-redux'
import store from './store'
import IdpTemplate from './IdpTemplate'
import { I18nProvider } from './I18nContext'

const { I18n } = window

const IdpReport = () => (
  <Provider store={store}>
    <I18nProvider I18n={I18n}>
      <IdpTemplate />
    </I18nProvider>
  </Provider>
)

export default IdpReport
