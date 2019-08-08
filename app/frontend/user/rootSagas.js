import { all } from 'redux-saga/effects'
import { watchers as evaluation } from './core/ThreesixtyCampaign/evaluation'
import { watchers as currentUser } from './core/temp/currentUser'

export default function* () {
  yield all([...evaluation, ...currentUser])
}
