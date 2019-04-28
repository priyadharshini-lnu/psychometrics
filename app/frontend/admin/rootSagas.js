import { all } from 'redux-saga/effects'
import { watchers as subjects } from './core/threeSixtyCampaign/subjects'
import { watchers as participationOptions } from './core/threeSixtyCampaign/option/participants'

export default function* () {
  yield all([...subjects, ...participationOptions])
}
