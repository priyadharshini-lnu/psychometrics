import { all } from 'redux-saga/effects'
import { watchers as subjects } from './core/threeSixtyCampaign/subjects'
import participantOptions from './core/threeSixtyCampaign/participantOptions/watchers'

export default function* () {
  yield all([...subjects, ...participantOptions])
}
