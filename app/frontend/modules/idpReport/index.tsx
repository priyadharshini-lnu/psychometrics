// import './styles/reset.css'
import './styles/main.css'
import { Provider } from 'react-redux'
import store from './store'
import IdpTemplate from './IdpTemplate'

const IdpReport = () => (
  <Provider store={store}>
    <IdpTemplate />
  </Provider>
)

export default IdpReport
