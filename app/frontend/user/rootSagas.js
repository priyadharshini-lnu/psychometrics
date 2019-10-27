import { all } from 'redux-saga/effects'
import { watchers as currentUser } from 'core/temp/currentUser'
import { watchers as evaluation } from './core/ThreesixtyCampaign/evaluation'
import { watchers as assign } from './core/ThreesixtyCampaign/assign'

export default function* () {
  yield all([...evaluation, ...currentUser, ...assign])
}
