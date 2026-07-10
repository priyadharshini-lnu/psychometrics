import { Provider } from 'react-redux'
import store from './store'
import AgileConfigBuilder from './AgileConfigBuilder'
import AgileConfigHeader from './AgileConfigHeader'

export default function (props) {
  return (
    <Provider store={store}>
      <AgileConfigHeader {...props} />
      <AgileConfigBuilder {...props} />
    </Provider>
  )
}
