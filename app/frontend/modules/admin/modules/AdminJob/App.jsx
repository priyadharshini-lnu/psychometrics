import { Provider } from 'react-redux'
import store from './store'
import AdminJobList from './AdminJobList'


export default function App () {
  return (
    <Provider store={store}>
      <AdminJobList />
    </Provider>
  )
}
