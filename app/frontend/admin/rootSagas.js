import { all } from 'redux-saga/effects'
import { watchers as subjects } from './core/threeSixtyCampaign/subjects'
import { watchers as evaluators } from './core/threeSixtyCampaign/evaluators'
import participantOptions from './core/threeSixtyCampaign/participantOptions/watchers'
import reportOptions from './core/threeSixtyCampaign/reportOptions/watchers'
import { watchers as threeSixtyCampaign } from './core/threeSixtyCampaign'
import { watchers as subjectImportWatcher } from './core/threeSixtyCampaign/subjects/import'
import { watchers as messageOptionWatchers } from './core/threeSixtyCampaign/messageOptions'

export default function* () {
  yield all([
    ...subjects,
    ...subjectImportWatcher,
    ...evaluators,
    ...participantOptions,
    ...reportOptions,
    ...threeSixtyCampaign,
    ...messageOptionWatchers,
  ])
}
