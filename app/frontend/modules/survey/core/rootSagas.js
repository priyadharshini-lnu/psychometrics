import { all } from 'redux-saga/effects'
import { watchers as socket } from '~/modules/survey/core/temp/socket'
import { watchers as assessment } from '~/modules/survey/core/builder/assessment/watchers'
import { watchers as blockCenter } from '~/modules/survey/core/builder/blockCenter/watchers'
import { watchers as block } from '~/modules/survey/core/builder/assessment/block/watchers'
import { watchers as factors } from '~/modules/survey/core/builder/factors'
import { watchers as preview } from '~/modules/survey/core/preview/FlowProcessor/watchers'
import { watchers as resources } from '~/modules/survey/core/builder/resources'

export default function* () {
  yield all([...socket, ...assessment, ...blockCenter, ...block, ...factors, ...preview, ...resources])
}
