import { Provider } from 'react-redux'
import store from './store'
import AgileConfigBuilder from './AgileConfigBuilder'

export default function (props) {
  return (
    <Provider store={store}>
      <AgileConfigBuilder {...props} />
    </Provider>
  )
}
