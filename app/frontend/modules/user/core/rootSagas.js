import { all } from 'redux-saga/effects'
import { watchers as flow } from 'modules/survey/core/preview/FlowProcessor/watchers'
import { watchers as currentUser } from 'core/currentUser'
import { watchers as evaluation } from '../modules/threesixtyCampaign/core/evaluation'
import { watchers as assign } from '../modules/threesixtyCampaign/core/assign'

export default function* () {
  yield all([...evaluation, ...currentUser, ...assign, ...flow])
}
