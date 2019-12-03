import { createReducer } from 'utils/reduxUtils'
import {
  select, takeEvery, take, put, call,
} from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { ENABLE, DISABLE } from 'core/builder/assessment/actions'
import NotificationDispatcher from 'dispatchers/NotificationDispatcher'
import Socket from '../../cable/socket'

export const SUBSCRIBE_SOCKET = 'survey/temp/socket/SUBSCRIBE_SOCKET'
export const SUBSCRIBED_SOCKET = 'survey/temp/socket/SUBSCRIBED_SOCKET'
export const UNSUBSCRIBE_SOCKET = 'survey/temp/socket/UNSUBSCRIBE_SOCKET'
export const SOCKET_MESSAGE = 'survey/temp/socket/SOCKET_MESSAGE'

export const socketMessage = data => ({ type: SOCKET_MESSAGE, data })

export const subscribeSocket = (channel, data) => ({
  type: SUBSCRIBE_SOCKET, channel, data,
})

export const UnsubscribeSocket = () => ({ type: UNSUBSCRIBE_SOCKET })

export const subscribed = () => ({ type: SUBSCRIBED_SOCKET })

export const enableApp = () => ({ type: ENABLE })
export const disableApp = () => ({ type: DISABLE })

const defaultState = {
  initialized: null,
}

const HANDLERS = {
  [SUBSCRIBED_SOCKET]: () => ({ initialized: true }),
  [UNSUBSCRIBE_SOCKET]: () => ({ initialized: false }),
}

export default createReducer(HANDLERS, defaultState)

const createSocketChannel = (channel, data) => eventChannel((emit) => {
  const socket = new Socket(channel, data, {
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
  const { survey } = yield select()
  if (survey.temp.socket.initialized) { return }
  const socketChannel = yield call(createSocketChannel, channel, data)

  while (true) {
    const payload = yield take(socketChannel)
    if (payload.type === 'connected') {
      yield put(subscribed())
      yield put(enableApp())
    }
    if (payload.type === 'disconnect') {
      yield put(disableApp())
      NotificationDispatcher.notify({ level: 'error', message: 'Connection lost' })
    }
    if (payload.type === 'message') {
      yield put(socketMessage(payload.data))
    }
  }
}

export const watchers = [
  takeEvery(SUBSCRIBE_SOCKET, genSubsribeSocket),
]
