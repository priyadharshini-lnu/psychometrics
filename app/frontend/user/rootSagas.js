import { all } from 'redux-saga/effects'
import { watchers as evaluation } from './core/ThreesixtyCampaign/evaluation'

export default function* () {
  yield all([...evaluation])
}
