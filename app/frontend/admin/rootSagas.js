import { all } from 'redux-saga/effects'
import { watchers as subjects } from './core/threeSixtyCampaign/subjects'
import { watchers as evaluators } from './core/threeSixtyCampaign/evaluators'

export default function* () {
  yield all([...subjects, ...evaluators])
}
