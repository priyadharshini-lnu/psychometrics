import {
  SOCKET_MESSAGE,
} from '~/modules/reports/core/temp/socket'
import NotificationDispatcher from '../dispatchers/NotificationDispatcher'

export const RequestsPool = {}

const Socket = () => next => (action) => {
  if (action.type !== SOCKET_MESSAGE) { return next(action) }

  const { data, notification } = action

  if (notification) {
    NotificationDispatcher.notify(notification)
  }

  if (RequestsPool[data.request_id]) {
    RequestsPool[data.request_id](data.data)
    delete RequestsPool[data.request_id]
  } else {
    // eslint-disable-next-line no-console
    console.warn('Unhandled socket message', action)
  }
}

export default Socket
