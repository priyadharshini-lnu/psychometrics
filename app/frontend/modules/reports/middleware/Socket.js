import { normalize } from 'normalizr'
import AppStore from '~/modules/reports/store/AppStore'
import {
  SOCKET_MESSAGE,
} from '~/modules/reports/core/temp/socket'
import schema from '../store/schema'
import { INIT } from '../core/builder/actions'
import NotificationDispatcher from '../dispatchers/NotificationDispatcher'

export const RequestsPool = {}

const Socket = ({ dispatch }) => next => (action) => {
  if (action.type !== SOCKET_MESSAGE) { return next(action) }

  const { data, notification } = action

  if (notification) {
    NotificationDispatcher.notify(notification)
  }

  if (data.action === 'report_data') {
    const normalizedData = normalize(data.data, schema)
    AppStore.init(data.data)
    dispatch({ type: INIT, data: normalizedData })
  } else if (RequestsPool[data.request_id]) {
    RequestsPool[data.request_id](data.data)
    delete RequestsPool[data.request_id]
  } else {
    // eslint-disable-next-line no-console
    console.warn('Unhandled socket message', action)
  }
}

export default Socket
