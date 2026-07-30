import {
  select, takeEvery, take, put, call,
} from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { createReducer } from '~/utils/redux'
import { ENABLE, DISABLE } from '~/modules/survey/core/builder/assessment/actions'
import NotificationDispatcher from '~/modules/survey/dispatchers/NotificationDispatcher'
import { RequestsPool } from '~/modules/survey/middleware/Socket'
import Socket from '../../cable/socket'

const { I18n } = window

export const SUBSCRIBE_SOCKET = 'survey/temp/socket/SUBSCRIBE_SOCKET'
export const SUBSCRIBED_SOCKET = 'survey/temp/socket/SUBSCRIBED_SOCKET'
export const UNSUBSCRIBE_SOCKET = 'survey/temp/socket/UNSUBSCRIBE_SOCKET'
export const SOCKET_MESSAGE = 'survey/temp/socket/SOCKET_MESSAGE'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SocketInterface {
  channel: any
  remove()
}

let socket: SocketInterface

export const socketMessage = data => ({ type: SOCKET_MESSAGE, data })

export const subscribeSocket = (channel, data) => ({
  type: SUBSCRIBE_SOCKET, channel, data,
})

export const UnsubscribeSocket = () => ({ type: UNSUBSCRIBE_SOCKET })

export const subscribed = () => ({ type: SUBSCRIBED_SOCKET })

export const enableApp = () => ({ type: ENABLE })
export const disableApp = ({ reason = 'unknown', message = null } = {}) => ({
  type: DISABLE,
  payload: { reason, message },
})

let count = 1

interface MetaData {
  data: any
  request_id?: string
}

export const perform = (action, data, onResponce) => {
  count += 1
  const reqId = `req_${Date.now() + count}`
  const metaData: MetaData = { data }
  if (onResponce) {
    RequestsPool[reqId] = onResponce
    metaData.request_id = reqId
  }
  socket.channel.perform(action, metaData)
}

interface State {
  initialized: boolean
}

const defaultState: State = {
  initialized: false,
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


function* genSubsribeSocket ({ channel, data }: ReturnType<typeof subscribeSocket>) {
  const { survey } = yield select()
  if (survey.ui.socket.initialized) { return }
  const socketChannel = yield call(createSocketChannel, channel, data)

  while (true) {
    const payload = yield take(socketChannel)
    if (payload.type === 'connected') {
      yield put(subscribed())
      yield put(enableApp())
    }
    if (payload.type === 'disconnect') {
      const disconnectMessage = I18n.t('shared.internet_disconnected_message')
      yield put(disableApp({ reason: 'connection_lost', message: disconnectMessage }))
      NotificationDispatcher.notify({ level: 'error', message: disconnectMessage })
    }
    if (payload.type === 'message') {
      yield put(socketMessage(payload.data))
    }
  }
}

export const watchers = [
  takeEvery(SUBSCRIBE_SOCKET, genSubsribeSocket),
]
