import humps from 'humps'
import { SOCKET_MESSAGE } from '~/core/socket'
import { NEW_COMMENT, UPDATE_COMMENT } from '~/modules/admin/modules/campaigns/core/userReports'

export const RequestsPool = {}

const Socket = ({ dispatch }) => next => (action) => {
  if (action.type !== SOCKET_MESSAGE) { return next(action) }

  const { data } = action

  if (data.action === 'new_comment') {
    dispatch({ type: NEW_COMMENT, data: humps.camelizeKeys(data) })
  } else if (data.action === 'update_comment') {
    dispatch({ type: UPDATE_COMMENT, data: humps.camelizeKeys(data) })
  } else if (RequestsPool[data.request_id]) {
    RequestsPool[data.request_id](data.data)
    delete RequestsPool[data.request_id]
  } else {
    console.warn('Unhandled socket message', action)
  }
}

export default Socket
