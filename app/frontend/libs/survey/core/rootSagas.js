import { all } from 'redux-saga/effects'
import { watchers as socket } from 'core/temp/socket'

export default function* () {
  yield all([...socket])
}
