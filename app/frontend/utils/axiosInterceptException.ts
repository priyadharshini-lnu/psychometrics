import axios from 'axios'
import { useExceptionStore } from '~/core/exception'

axios.interceptors.response.use(null, (error) => {
  if (error.response.status === 500 && error.response.data && error.response.data.exception) {
    const { setException } = useExceptionStore.getState()
    setException(error.response.data)
  }
  return Promise.reject(error)
})
