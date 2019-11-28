import AppStore from 'store/AppStore'
import {
  SOCKET_MESSAGE,
} from '../core/temp/socket'

import { INIT } from '../core/builder/assessment/actions'
import NotificationDispatcher from '../dispatchers/NotificationDispatcher'

const RequestsPool = {}

const Socket = ({ dispatch }) => next => (action) => {
  if (action.type !== SOCKET_MESSAGE) { return next(action) }

  const { data, notification } = action

  if (notification) {
    NotificationDispatcher.notify(notification)
  }

  if (data.action === 'assessment_data') {
    AppStore.init(data.data)
    dispatch({ type: INIT, data: data.data })
  } else if (data.action === 'question_data') {
    AppStore.initQCenter(data.data)
  } else if (data.action === 'block_data') {
    AppStore.initBCenter(data.data)
  } else if (data.action === 'assessment_factors') {
    AppStore.initScoring(data.data)
  } else {
    console.warn('Unhandled socket message', action)
  }

  if (RequestsPool[data.request_id]) {
    RequestsPool[data.request_id](data.data)
    delete RequestsPool[data.request_id]
  }
}

export default Socket
