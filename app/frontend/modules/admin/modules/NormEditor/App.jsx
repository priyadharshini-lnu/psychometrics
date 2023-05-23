import { Provider } from 'react-redux'
import store from './store'
import NormEditor from './NormEditor'

export default function (props) {
  return (
    <Provider store={store}>
      <NormEditor {...props} />
    </Provider>
  )
}
