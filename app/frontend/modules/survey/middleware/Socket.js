import { normalize } from 'normalizr'
import {
  SOCKET_MESSAGE,
} from '../core/temp/socket'
import schema from '../store/schema'
import { INIT } from '../core/builder/assessment/actions'
import { INIT_QUESTION_CENTER } from '../core/builder/questionCenter'
import NotificationDispatcher from '../dispatchers/NotificationDispatcher'
import { captureSchemaValidationError } from '~/utils/schemaValidationError'

export const RequestsPool = {}

const Socket = ({ dispatch }) => next => (action) => {
  if (action.type !== SOCKET_MESSAGE) { return next(action) }

  const { data, notification } = action

  data && captureSchemaValidationError(data)

  if (notification) {
    NotificationDispatcher.notify(notification)
  }

  if (data.action === 'question_data') {
    dispatch({ type: INIT_QUESTION_CENTER, data: data.data })
  } else if (data.action === 'block_data') {
    const normalizedData = normalize({
      id: data.data.id,
      blocks: [data.data],
      factors: {},
      question_recoding: [],
      flow: {},
    }, schema)
    dispatch({ type: INIT, data: normalizedData })
  } else if (data.action === 'assessment_factors') {
    // initScoring(data.data)  // @NOTE does it used anywhere??
  } else if (RequestsPool[data.request_id]) {
    RequestsPool[data.request_id](data.data)
    delete RequestsPool[data.request_id]
  } else {
    // eslint-disable-next-line no-console
    console.warn('Unhandled socket message', action)
  }
}

export default Socket
