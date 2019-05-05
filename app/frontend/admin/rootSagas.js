import { all } from 'redux-saga/effects'
import { watchers as subjects } from './core/threeSixtyCampaign/subjects'
import { watchers as participantOptions } from './core/threeSixtyCampaign/participantOptions'

export default function* () {
  yield all([...subjects, ...participantOptions])
}
