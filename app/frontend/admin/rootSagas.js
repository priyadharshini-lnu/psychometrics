import { all } from 'redux-saga/effects'
import { watchers as subjects } from './core/threeSixtyCampaign/subjects'

export default function* () {
  yield all([...subjects])
}
