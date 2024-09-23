import { all } from 'redux-saga/effects'
import { watchers as flow } from '~/modules/survey/core/preview/FlowProcessor/watchers'
import { watchers as currentUser } from '~/core/currentUser'
import { watchers as evaluation } from '../modules/campaigns/core/evaluation'
import { watchers as userAssessment } from '../modules/campaigns/core/userAssessment'

export default function* () {
  yield all([...evaluation, ...currentUser, ...flow, ...userAssessment])
}
