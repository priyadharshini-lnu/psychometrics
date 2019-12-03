import { all } from 'redux-saga/effects'
import { watchers as socket } from 'core/temp/socket'
import { watchers as block } from 'core/builder/assessment/block/actions'

export default function* () {
  yield all([...socket, ...block])
}
