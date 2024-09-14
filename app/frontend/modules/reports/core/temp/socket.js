import {
  select, takeEvery, take, put, call,
} from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { message } from 'antd'
import { createReducer } from '~/utils/redux'
import { ENABLE, DISABLE } from '~/modules/reports/core/builder/actions'
import { RequestsPool } from '~/modules/reports/middleware/Socket'
import Socket from '../../cable/socket'

export const SUBSCRIBE_SOCKET = 'survey/temp/socket/SUBSCRIBE_SOCKET'
export const SUBSCRIBED_SOCKET = 'survey/temp/socket/SUBSCRIBED_SOCKET'
export const UNSUBSCRIBE_SOCKET = 'survey/temp/socket/UNSUBSCRIBE_SOCKET'
export const SOCKET_MESSAGE = 'survey/temp/socket/SOCKET_MESSAGE'
let socket = null

export const socketMessage = data => ({ type: SOCKET_MESSAGE, data })

export const subscribeSocket = (channel, data) => ({
  type: SUBSCRIBE_SOCKET, channel, data,
})

export const UnsubscribeSocket = () => ({ type: UNSUBSCRIBE_SOCKET })

export const subscribed = () => ({ type: SUBSCRIBED_SOCKET })

export const enableApp = () => ({ type: ENABLE })
export const disableApp = () => ({ type: DISABLE })

let count = 1

export const perform = (action, data, onResponce) => {
  count += 1
  const reqId = `req_${Date.now() + count}`
  const metaData = { data }
  if (onResponce) {
    RequestsPool[reqId] = onResponce
    metaData.request_id = reqId
  }
  socket.channel.perform(action, metaData)
}

const defaultState = {
  initialized: null,
}

const HANDLERS = {
  [SUBSCRIBED_SOCKET]: () => ({ initialized: true }),
  [UNSUBSCRIBE_SOCKET]: () => ({ initialized: false }),
}

export default createReducer(HANDLERS, defaultState)

const createSocketChannel = (channel, data) => eventChannel((emit) => {
  socket = new Socket(channel, data, {
    onConnect: () => {
      emit({ type: 'connected' })
    },
    onReceived: (data) => {
      emit({ type: 'message', data })
    },
    onDisconnect: () => {
      emit({ type: 'disconnect', data })
    },
  })
  return () => {
    socket.remove()
  }
})


function* genSubsribeSocket ({ channel, data }) {
  const { report } = yield select()
  if (report.ui.socket.initialized) { return }
  const socketChannel = yield call(createSocketChannel, channel, data)

  while (true) {
    const payload = yield take(socketChannel)
    if (payload.type === 'connected') {
      yield put(subscribed())
      yield put(enableApp())
      message.info('Connection established')
    }
    if (payload.type === 'disconnect') {
      yield put(disableApp())
      message.warning('Connection lost')
    }
    if (payload.type === 'message') {
      yield put(socketMessage(payload.data))
    }
  }
}

export const watchers = [
  takeEvery(SUBSCRIBE_SOCKET, genSubsribeSocket),
]
