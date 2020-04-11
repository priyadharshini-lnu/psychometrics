import { all } from 'redux-saga/effects'
import { watchers as socket } from './temp/socket'

export default function* () {
  yield all([...socket])
}
