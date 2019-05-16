import { all } from 'redux-saga/effects'
import { watchers as subjects } from './core/threeSixtyCampaign/subjects'
import { watchers as evaluators } from './core/threeSixtyCampaign/evaluators'
import participantOptions from './core/threeSixtyCampaign/participantOptions/watchers'
import { watchers as threeSixtyCampaign } from './core/threeSixtyCampaign'

export default function* () {
  yield all([...subjects, ...evaluators, ...participantOptions, ...threeSixtyCampaign])
}
