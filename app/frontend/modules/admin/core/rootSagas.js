import { all } from 'redux-saga/effects'
import filterAndPaginationWatcher from '~/modules/admin/core/filterAndPagination/watchers'
import { watchers as flow } from '~/modules/survey/core/preview/FlowProcessor/watchers'
import { watchers as socket } from '~/core/socket'
import { watchers as subjects } from '../modules/threeSixtyCampaign/core/subjects'
import { watchers as evaluators } from '../modules/threeSixtyCampaign/core/evaluators'
import participantOptions from '../modules/threeSixtyCampaign/core/participantOptions/watchers'
import reportOptions from '../modules/threeSixtyCampaign/core/reportOptions/watchers'
import { watchers as threeSixtyCampaign } from '../modules/threeSixtyCampaign/core'
import { watchers as subjectImportWatcher } from '../modules/threeSixtyCampaign/core/subjects/import'
import { watchers as messageOptionWatchers } from '../modules/threeSixtyCampaign/core/messageOptions'
import { watchers as emailScheduleWatchers } from '../modules/threeSixtyCampaign/core/emailSchedules'
// eslint-disable-next-line max-len
import { watchers as recipientCriteriaWatchers } from '../modules/threeSixtyCampaign/core/emailSchedules/recipientCriteria'
import { watchers as campaignAssessment } from '../modules/campaigns/core/assessments/watchers'
import { watchers as user } from '../modules/campaigns/core/users'
import { watchers as campaign } from '../modules/campaigns/core/list'
import { watchers as assessors } from '../modules/campaigns/core/assessors'
import { watchers as userAssessments } from '../modules/campaigns/core/userAssessments'
import { watchers as userReports } from '../modules/campaigns/core/userReports'
import { watchers as assessorAssessments } from '../modules/campaigns/core/assessorAssessments'

export default function* () {
  yield all([
    ...subjects,
    ...subjectImportWatcher,
    ...evaluators,
    ...participantOptions,
    ...reportOptions,
    ...threeSixtyCampaign,
    ...messageOptionWatchers,
    ...emailScheduleWatchers,
    ...recipientCriteriaWatchers,
    ...filterAndPaginationWatcher,
    ...campaignAssessment,
    ...user,
    ...campaign,
    ...flow,
    ...assessors,
    ...userAssessments,
    ...userReports,
    ...socket,
    ...assessorAssessments,
  ])
}
