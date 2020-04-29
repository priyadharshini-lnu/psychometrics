import { all } from 'redux-saga/effects'
import { watchers as socket } from './temp/socket'
import { watchers as builder } from './builder/watchers'

export default function* () {
  yield all([...socket, ...builder])
}
