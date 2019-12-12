import { all } from 'redux-saga/effects'
import { watchers as socket } from 'core/temp/socket'
import { watchers as block } from 'core/builder/assessment/block/actions'
import { watchers as factors } from 'core/builder/factors'

export default function* () {
  yield all([...socket, ...block, ...factors])
}
