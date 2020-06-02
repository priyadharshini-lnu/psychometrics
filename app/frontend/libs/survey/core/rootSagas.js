import { all } from 'redux-saga/effects'
import { watchers as socket } from 'core/temp/socket'
import { watchers as assessment } from 'core/builder/assessment/watchers'
import { watchers as blockCenter } from 'core/builder/blockCenter/watchers'
import { watchers as block } from 'core/builder/assessment/block/watchers'
import { watchers as factors } from 'core/builder/factors'
import { watchers as preview } from 'core/preview/FlowProcessor/watchers'
import { watchers as resources } from 'core/builder/resources'

export default function* () {
  yield all([...socket, ...assessment, ...blockCenter, ...block, ...factors, ...preview, ...resources])
}
